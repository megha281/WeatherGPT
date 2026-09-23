/**
 * Google Gemini integration with weather tool (function) calling.
 *
 * Rules enforced here:
 *  - Gemini never invents weather values. Every number in an answer comes from
 *    a tool result (Open-Meteo) or from the deterministic risk engine.
 *  - General meteorological explanation comes from the RAG knowledge base.
 *  - If no API key is configured, or Gemini fails, we still answer using a
 *    deterministic local pipeline so the app remains usable and honest.
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const weatherService = require('./weatherService');
const geocodingService = require('./geocodingService');
const ragService = require('./ragService');
const climateService = require('./climateService');
const alertService = require('./alertService');
const { analyzeRisk, analyzeFromForecast } = require('./riskEngine');
const { parseWhen } = require('../utils/dateParse');

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu' };
const MAX_TOOL_ROUNDS = 5;

/* --------------------------- tool declarations --------------------------- */

const TOOL_DECLARATIONS = [
  {
    name: 'getLocation',
    description:
      'Resolve a place name (city, town, district) to coordinates. Call this first whenever the user names a place that is not the active location.',
    parameters: {
      type: 'OBJECT',
      properties: { query: { type: 'STRING', description: 'Place name, e.g. "Bellary" or "Bengaluru"' } },
      required: ['query'],
    },
  },
  {
    name: 'getCurrentWeather',
    description: 'Observed current conditions for coordinates: temperature, feels like, humidity, wind, rain, pressure, UV, sunrise and sunset.',
    parameters: {
      type: 'OBJECT',
      properties: { latitude: { type: 'NUMBER' }, longitude: { type: 'NUMBER' } },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'getHourlyForecast',
    description: 'Hour-by-hour forecast. Use for questions about a part of a day such as "tomorrow evening" or "this afternoon".',
    parameters: {
      type: 'OBJECT',
      properties: {
        latitude: { type: 'NUMBER' },
        longitude: { type: 'NUMBER' },
        hours: { type: 'NUMBER', description: 'How many hours ahead to fetch, up to 120. Default 48.' },
        date: { type: 'STRING', description: 'Optional YYYY-MM-DD filter.' },
        startHour: { type: 'NUMBER', description: 'Optional local start hour 0-23.' },
        endHour: { type: 'NUMBER', description: 'Optional local end hour 0-23.' },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'getDailyForecast',
    description: 'Daily forecast for up to 16 days: min and max temperature, condition, rainfall, rain probability and wind.',
    parameters: {
      type: 'OBJECT',
      properties: { latitude: { type: 'NUMBER' }, longitude: { type: 'NUMBER' }, days: { type: 'NUMBER' } },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'getWeatherAlerts',
    description: 'Official warnings where a feed is available, plus WeatherGPT risk assessments for the next few days.',
    parameters: {
      type: 'OBJECT',
      properties: { latitude: { type: 'NUMBER' }, longitude: { type: 'NUMBER' } },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'analyzeWeatherRisk',
    description: 'Run the deterministic risk engine for coordinates. Returns level (LOW/MODERATE/HIGH/SEVERE), type, reason and advisory. Use this instead of judging risk yourself.',
    parameters: {
      type: 'OBJECT',
      properties: { latitude: { type: 'NUMBER' }, longitude: { type: 'NUMBER' } },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'searchWeatherKnowledge',
    description: 'Search the WeatherGPT meteorology and disaster-safety knowledge base. Use for explanations, definitions, thresholds and safety guidance.',
    parameters: {
      type: 'OBJECT',
      properties: { query: { type: 'STRING' } },
      required: ['query'],
    },
  },
  {
    name: 'getClimateInformation',
    description: 'Long-term climate statistics for coordinates computed from the ERA5 archive: monthly normals, annual rainfall and temperature trend.',
    parameters: {
      type: 'OBJECT',
      properties: { latitude: { type: 'NUMBER' }, longitude: { type: 'NUMBER' } },
      required: ['latitude', 'longitude'],
    },
  },
];

/* ------------------------------ tool runner ------------------------------ */

function filterHours(hours, { date, startHour, endHour }) {
  if (!date && startHour === undefined) return hours;
  return hours.filter((h) => {
    const d = new Date(h.time);
    const localDate = h.time.slice(0, 10);
    if (date && localDate !== date) return false;
    if (startHour === undefined || endHour === undefined) return true;
    const hour = d.getHours();
    return startHour <= endHour ? hour >= startHour && hour <= endHour : hour >= startHour || hour <= endHour;
  });
}

async function executeTool(name, args = {}, ctx) {
  switch (name) {
    case 'getLocation': {
      const loc = await geocodingService.resolveLocation(args.query);
      ctx.location = loc;
      ctx.sources.add('Open-Meteo geocoding');
      return loc;
    }
    case 'getCurrentWeather': {
      const current = await weatherService.getCurrentWeather(args.latitude, args.longitude);
      ctx.current = current;
      ctx.sources.add('Open-Meteo');
      return current;
    }
    case 'getHourlyForecast': {
      const data = await weatherService.getHourlyForecast(args.latitude, args.longitude, {
        hours: Math.min(120, args.hours || 48),
      });
      const hours = filterHours(data.hours, args);
      ctx.hourly = { ...data, hours };
      ctx.sources.add('Open-Meteo');
      return { ...data, hours: hours.slice(0, 48) };
    }
    case 'getDailyForecast': {
      const data = await weatherService.getDailyForecast(args.latitude, args.longitude, { days: args.days || 7 });
      ctx.daily = data;
      ctx.sources.add('Open-Meteo');
      return data;
    }
    case 'getWeatherAlerts': {
      const alerts = await alertService.getAlerts(args.latitude, args.longitude, ctx.location || {});
      ctx.alerts = alerts;
      ctx.sources.add('WeatherGPT Risk Assessment');
      if (alerts.official.length) ctx.sources.add(alerts.official[0].source);
      return alerts;
    }
    case 'analyzeWeatherRisk': {
      const [current, daily, hourly] = await Promise.all([
        ctx.current || weatherService.getCurrentWeather(args.latitude, args.longitude),
        ctx.daily || weatherService.getDailyForecast(args.latitude, args.longitude, { days: 3 }),
        ctx.hourly || weatherService.getHourlyForecast(args.latitude, args.longitude, { hours: 24 }),
      ]);
      ctx.current = current;
      ctx.daily = daily;
      ctx.hourly = hourly;
      const risk = analyzeFromForecast({ current, daily, hourly });
      ctx.risk = risk;
      ctx.sources.add('Open-Meteo');
      ctx.sources.add('WeatherGPT Risk Assessment');
      return risk;
    }
    case 'searchWeatherKnowledge': {
      const { results } = await ragService.search(args.query, { topK: 4 });
      ctx.knowledge = results;
      if (results.length) ctx.sources.add('WeatherGPT Knowledge Base');
      return { results: results.map(({ heading, title, text, source }) => ({ heading, title, text, source })) };
    }
    case 'getClimateInformation': {
      const climate = await climateService.getClimateInformation(args.latitude, args.longitude);
      ctx.climate = climate;
      ctx.sources.add('Open-Meteo Historical Weather API (ERA5)');
      return {
        period: climate.period,
        summary: climate.summary,
        monthlyNormals: climate.monthlyNormals,
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/* ------------------------------ prompt setup ----------------------------- */

function buildSystemInstruction({ language, location, now }) {
  const langName = LANGUAGE_NAMES[language] || 'English';
  return `You are WeatherGPT, a conversational weather assistant built for Smart India Hackathon 2026 (problem SIH26068, Disaster Management theme).

Current date and time: ${now.toString()}.
Active location: ${location ? `${location.name}${location.state ? ', ' + location.state : ''}${location.country ? ', ' + location.country : ''} (${location.latitude}, ${location.longitude})` : 'not set - ask or resolve one with getLocation'}.

Hard rules:
1. Never state a weather number you did not receive from a tool result. If you do not have the data, call the tool. If a tool fails, say plainly that the data is unavailable.
2. Use analyzeWeatherRisk for risk levels. Do not assign your own severity.
3. Anything from analyzeWeatherRisk or getWeatherAlerts with sourceType "weathergpt" is a WeatherGPT Risk Assessment, not an official warning. Only items with sourceType "official" may be called official. For India, point people to IMD (mausam.imd.gov.in) for authoritative warnings when the topic is serious.
4. Use searchWeatherKnowledge for explanations, definitions, thresholds and safety advice.
5. Weather data comes from Open-Meteo, never from you.

Answering style:
- Reply in ${langName}. Keep numbers and units in digits (28°C, 80%, 15 km/h) whatever the language.
- Lead with a direct answer to the question asked, then the few numbers that support it, then one practical recommendation.
- Be concise: about 60 to 120 words unless the user asks for detail. Plain sentences, no headings, at most a couple of short bullet lines.
- Give advice a person can act on ("rain is likely after 6 pm, carry an umbrella and leave 15 minutes early") rather than raw values alone.
- Do not exaggerate. Do not promise certainty about the weather.`;
}

/* ------------------------------ Gemini call ------------------------------ */

async function callGemini({ contents, systemInstruction, useTools = true }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`;
  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 1024 },
    safetySettings: [],
  };
  if (useTools) body.tools = [{ functionDeclarations: TOOL_DECLARATIONS }];

  const { data } = await axios.post(url, body, {
    params: { key: env.GEMINI_API_KEY },
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  const candidate = data?.candidates?.[0];
  if (!candidate) throw new Error('Gemini returned no candidates');
  return candidate.content || { role: 'model', parts: [] };
}

function historyToContents(history = []) {
  return history
    .filter((m) => m && m.content)
    .slice(-8)
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content) }] }));
}

/* --------------------------- deterministic mode -------------------------- */

/**
 * Used when Gemini is not configured or fails. Runs the same tools with rule
 * based intent detection and composes the answer from real values only.
 */
async function deterministicAnswer({ question, location, ctx }) {
  const q = question.toLowerCase();
  const when = parseWhen(question);

  let loc = location;
  const placeMatch = question.match(/\b(?:in|at|for|near)\s+([A-Z][A-Za-z\u00C0-\u024F.'-]+(?:\s+[A-Z][A-Za-z.'-]+)?)/);
  if (placeMatch) {
    try {
      loc = await executeTool('getLocation', { query: placeMatch[1].trim() }, ctx);
    } catch (err) {
      logger.debug(`Deterministic location lookup failed: ${err.message}`);
    }
  }
  if (!loc) {
    return {
      answer:
        'Tell me which place you want the weather for (for example "weather in Bellary"), or pick a location from the search box, and I will pull the current forecast.',
      mode: 'deterministic',
    };
  }
  ctx.location = loc;

  const [current, hourly, daily] = await Promise.all([
    executeTool('getCurrentWeather', { latitude: loc.latitude, longitude: loc.longitude }, ctx),
    executeTool('getHourlyForecast', { latitude: loc.latitude, longitude: loc.longitude, hours: 72 }, ctx),
    executeTool('getDailyForecast', { latitude: loc.latitude, longitude: loc.longitude, days: 7 }, ctx),
  ]);
  const risk = analyzeFromForecast({ current, daily, hourly });
  ctx.risk = risk;
  ctx.sources.add('WeatherGPT Risk Assessment');

  const { results: knowledge } = await ragService.search(question, { topK: 2 });
  ctx.knowledge = knowledge;
  if (knowledge.length) ctx.sources.add('WeatherGPT Knowledge Base');

  const dayIndex = Math.min(when.dayOffset, daily.days.length - 1);
  const day = daily.days[dayIndex];
  const windowHours = filterHours(hourly.hours, {
    date: when.date,
    startHour: when.partOfDay ? when.startHour : undefined,
    endHour: when.partOfDay ? when.endHour : undefined,
  });
  const scope = windowHours.length ? windowHours : hourly.hours.slice(0, 12);
  const peakRain = scope.reduce((m, h) => Math.max(m, Number(h.rainProbability) || 0), 0);
  const rainMm = Number(scope.reduce((s, h) => s + (Number(h.precipitation) || 0), 0).toFixed(1));
  const temps = scope.map((h) => h.temperature).filter(Number.isFinite);
  const label = `${when.dayLabel}${when.partOfDay ? ` ${when.partOfDay}` : ''}`;

  const lines = [];
  if (/rain|umbrella|wet|barish|male|mazhai/.test(q)) {
    lines.push(
      peakRain >= 60
        ? `Rain is likely in ${loc.name} ${label}: the highest hourly chance in that window is ${peakRain}%, with about ${rainMm} mm expected.`
        : peakRain >= 30
          ? `Rain is possible but not certain in ${loc.name} ${label}: the highest hourly chance is ${peakRain}%, with about ${rainMm} mm expected.`
          : `Rain looks unlikely in ${loc.name} ${label}. The highest hourly chance in that window is ${peakRain}%.`
    );
  } else if (/hot|temperature|heat|cold|warm/.test(q)) {
    lines.push(
      `In ${loc.name} ${label}, temperatures run about ${temps.length ? `${Math.min(...temps)}–${Math.max(...temps)}°C` : `${day.minTemp}–${day.maxTemp}°C`}. It is ${current.temperature}°C right now and feels like ${current.feelsLike}°C.`
    );
  } else if (/travel|safe|drive|ride|go out/.test(q)) {
    lines.push(
      `For ${loc.name} ${label}: ${day.condition.toLowerCase()}, up to ${day.rainProbability}% chance of rain, winds to ${day.windGustsMax} km/h, ${day.minTemp}–${day.maxTemp}°C.`
    );
  } else {
    lines.push(
      `${loc.name} right now: ${current.temperature}°C (feels like ${current.feelsLike}°C), ${current.condition.toLowerCase()}, humidity ${current.humidity}%, wind ${current.windSpeed} km/h. ${when.dayLabel === 'today' ? 'Today' : `On ${day.date}`} runs ${day.minTemp}–${day.maxTemp}°C with a ${day.rainProbability}% chance of rain.`
    );
  }

  lines.push(`WeatherGPT risk assessment: ${risk.level} — ${risk.type}. ${risk.advisory}`);

  return {
    answer: lines.join('\n\n'),
    mode: 'deterministic',
  };
}

/* ------------------------------- main entry ------------------------------ */

/**
 * @param {object} options
 * @param {string} options.question
 * @param {object|null} options.location active location {name, latitude, longitude,...}
 * @param {string} options.language ISO code (en, hi, kn, ta, te)
 * @param {Array} options.history prior messages [{role, content}]
 */
async function askWeatherGPT({ question, location = null, language = 'en', history = [] }) {
  const ctx = {
    location: location && Number.isFinite(Number(location.latitude)) ? location : null,
    current: null,
    hourly: null,
    daily: null,
    risk: null,
    alerts: null,
    climate: null,
    knowledge: [],
    sources: new Set(),
    toolCalls: [],
  };

  const started = Date.now();
  let answer = '';
  let mode = 'gemini';

  if (!env.geminiConfigured) {
    const fallback = await deterministicAnswer({ question, location: ctx.location, ctx });
    answer = fallback.answer;
    mode = 'deterministic-no-key';
  } else {
    try {
      const systemInstruction = buildSystemInstruction({ language, location: ctx.location, now: new Date() });
      const contents = [...historyToContents(history), { role: 'user', parts: [{ text: question }] }];

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        // eslint-disable-next-line no-await-in-loop
        const content = await callGemini({ contents, systemInstruction });
        contents.push(content);

        const calls = (content.parts || []).filter((p) => p.functionCall).map((p) => p.functionCall);
        if (!calls.length) {
          answer = (content.parts || []).map((p) => p.text || '').join('').trim();
          break;
        }

        // eslint-disable-next-line no-await-in-loop
        const responses = await Promise.all(
          calls.map(async (call) => {
            const args = call.args || {};
            ctx.toolCalls.push({ name: call.name, args });
            try {
              const result = await executeTool(call.name, args, ctx);
              return { functionResponse: { name: call.name, response: { result } } };
            } catch (err) {
              logger.warn(`Tool ${call.name} failed: ${err.message}`);
              return {
                functionResponse: {
                  name: call.name,
                  response: { error: err.message, note: 'Tell the user this data is unavailable. Do not estimate it.' },
                },
              };
            }
          })
        );
        contents.push({ role: 'user', parts: responses });
      }

      if (!answer) {
        // Ran out of rounds: ask once more without tools so we still reply.
        const content = await callGemini({
          contents: [...contents, { role: 'user', parts: [{ text: 'Answer now using the data already gathered.' }] }],
          systemInstruction,
          useTools: false,
        });
        answer = (content.parts || []).map((p) => p.text || '').join('').trim();
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.error?.message || err.message;
      logger.error(`Gemini request failed${status ? ` (${status})` : ''}: ${detail}`);
      const fallback = await deterministicAnswer({ question, location: ctx.location, ctx });
      answer = fallback.answer;
      mode = status === 429 ? 'deterministic-rate-limited' : 'deterministic-fallback';
    }
  }

  // Risk is always computed deterministically, even if Gemini never asked for it.
  if (!ctx.risk && ctx.current) {
    ctx.risk = analyzeFromForecast({ current: ctx.current, daily: ctx.daily, hourly: ctx.hourly });
    ctx.sources.add('WeatherGPT Risk Assessment');
  }

  const sources = [];
  if (ctx.sources.has('Open-Meteo') || ctx.sources.has('Open-Meteo geocoding')) {
    sources.push({ kind: 'Weather data', name: 'Open-Meteo', url: 'https://open-meteo.com' });
  }
  if (ctx.sources.has('Open-Meteo Historical Weather API (ERA5)')) {
    sources.push({ kind: 'Climate data', name: 'Open-Meteo Historical (ERA5)', url: 'https://open-meteo.com/en/docs/historical-weather-api' });
  }
  if (ctx.knowledge?.length) {
    sources.push({
      kind: 'Knowledge',
      name: 'WeatherGPT Knowledge Base',
      detail: ctx.knowledge.map((k) => k.title).filter((v, i, a) => a.indexOf(v) === i).join('; '),
    });
  }
  if (ctx.risk) sources.push({ kind: 'Risk analysis', name: 'WeatherGPT Risk Engine (deterministic rules)' });
  sources.push({
    kind: 'AI',
    name: mode.startsWith('deterministic') ? 'WeatherGPT rule-based mode (Gemini unavailable)' : `Google Gemini (${env.GEMINI_MODEL})`,
  });

  return {
    answer: answer || 'I could not produce an answer for that. Try rephrasing the question or naming a location.',
    mode,
    location: ctx.location
      ? {
          name: ctx.location.name,
          city: ctx.location.city || ctx.location.name,
          state: ctx.location.state || '',
          country: ctx.location.country || '',
          latitude: ctx.location.latitude,
          longitude: ctx.location.longitude,
        }
      : null,
    weather: ctx.current
      ? {
          temperature: ctx.current.temperature,
          feelsLike: ctx.current.feelsLike,
          condition: ctx.current.condition,
          humidity: ctx.current.humidity,
          windSpeed: ctx.current.windSpeed,
          rainProbability: ctx.current.rainProbability,
          units: ctx.current.units,
          observedAt: ctx.current.time,
        }
      : null,
    forecastHighlights: ctx.daily
      ? ctx.daily.days.slice(0, 3).map((d) => ({
          date: d.date,
          minTemp: d.minTemp,
          maxTemp: d.maxTemp,
          rainProbability: d.rainProbability,
          condition: d.condition,
        }))
      : null,
    risk: ctx.risk
      ? {
          level: ctx.risk.level,
          type: ctx.risk.type,
          reason: ctx.risk.reason,
          sourceType: 'weathergpt',
          label: 'WeatherGPT Risk Assessment',
        }
      : null,
    advisory: ctx.risk?.advisory || null,
    alerts: ctx.alerts || null,
    knowledge: (ctx.knowledge || []).map((k) => ({ title: k.title, heading: k.heading, score: k.score, source: k.source })),
    toolCalls: ctx.toolCalls,
    sources,
    language,
    elapsedMs: Date.now() - started,
  };
}

/** Short conversation title, used by chat history. */
async function generateTitle(question) {
  const fallback = question.length > 48 ? `${question.slice(0, 45)}...` : question;
  if (!env.geminiConfigured) return fallback;
  try {
    const content = await callGemini({
      contents: [{ role: 'user', parts: [{ text: `Give a 3 to 6 word title for this weather question. Reply with the title only.\n\n${question}` }] }],
      systemInstruction: 'You write very short, plain titles.',
      useTools: false,
    });
    const text = (content.parts || []).map((p) => p.text || '').join('').trim().replace(/^["']|["']$/g, '');
    return text.slice(0, 80) || fallback;
  } catch {
    return fallback;
  }
}

module.exports = { askWeatherGPT, generateTitle, TOOL_DECLARATIONS, executeTool, LANGUAGE_NAMES };
