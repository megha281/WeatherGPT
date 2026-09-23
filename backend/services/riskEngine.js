/**
 * Deterministic weather risk engine.
 *
 * Every rule below is a threshold check on real numbers returned by
 * Open-Meteo. No language model is involved, so the same input always
 * produces the same risk level. Output is always labelled as a
 * "WeatherGPT Risk Assessment" - never as an official warning.
 *
 * Thresholds follow commonly used operational definitions
 * (e.g. IMD rainfall classes, WHO/WMO heat guidance, Beaufort wind scale).
 */

const { isThunderstormCode, isHeavyRainCode } = require('../utils/weatherCodes');

const LEVELS = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];

/**
 * Missing values must stay missing. Number(null) is 0, which would make an
 * absent minimum temperature look like a freezing night, so every rule reads
 * its inputs through this helper and skips when the value is not reported.
 */
const num = (value) =>
  value === null || value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Number(value);
const levelValue = (level) => LEVELS.indexOf(level);
const maxLevel = (a, b) => (levelValue(a) >= levelValue(b) ? a : b);

function rainfallRisk({ rainfallMm, rainProbability, weatherCode }) {
  // IMD daily rainfall classes: 64.5-115.5 mm heavy, 115.6-204.4 very heavy, >204.4 extremely heavy.
  if (rainfallMm >= 115) {
    return {
      type: 'Very heavy rainfall',
      level: 'SEVERE',
      reason: `Forecast rainfall of ${rainfallMm} mm is in the very heavy category.`,
      advisory:
        'Avoid low-lying areas, underpasses and riverbanks. Postpone non-essential travel and follow official district advisories.',
    };
  }
  if (rainfallMm >= 64.5 || isHeavyRainCode(weatherCode)) {
    return {
      type: 'Heavy rainfall',
      level: 'HIGH',
      reason:
        rainfallMm >= 64.5
          ? `Forecast rainfall of ${rainfallMm} mm meets the heavy rainfall threshold.`
          : `The forecast condition is heavy rain, with about ${rainfallMm} mm expected.`,
      advisory:
        'Expect waterlogging and slower traffic. Allow extra travel time, avoid flooded roads and keep a torch and charged phone handy.',
    };
  }
  if (rainfallMm >= 15 || rainProbability >= 70) {
    return {
      type: 'Rain likely',
      level: 'MODERATE',
      reason: `Rain probability is ${rainProbability}% with about ${rainfallMm} mm expected.`,
      advisory: 'Carry rain protection and allow extra travel time, especially during peak hours.',
    };
  }
  if (rainProbability >= 40) {
    return {
      type: 'Light rain possible',
      level: 'LOW',
      reason: `Rain probability is ${rainProbability}%.`,
      advisory: 'A short shower is possible. An umbrella is a reasonable precaution.',
    };
  }
  return null;
}

function thunderstormRisk({ weatherCode, windGusts }) {
  if (!isThunderstormCode(weatherCode)) return null;
  const level = windGusts >= 60 ? 'SEVERE' : 'HIGH';
  return {
    type: 'Thunderstorm and lightning',
    level,
    reason: `Thunderstorm conditions are forecast${windGusts ? ` with gusts near ${windGusts} km/h` : ''}.`,
    advisory:
      'Move indoors before the storm arrives. Stay away from tall isolated trees, metal structures and open fields, and unplug sensitive appliances.',
  };
}

function heatRisk({ maxTemp, feelsLike, humidity }) {
  const values = [num(maxTemp), num(feelsLike)].filter((v) => v !== null);
  if (!values.length) return null;
  const effective = Math.max(...values);
  if (effective >= 45) {
    return {
      type: 'Extreme heat',
      level: 'SEVERE',
      reason: `Temperatures are expected to reach about ${effective}°C.`,
      advisory:
        'Stay indoors between 11 am and 4 pm, drink water frequently even without thirst, and check on elderly neighbours and outdoor workers.',
    };
  }
  if (effective >= 40) {
    return {
      type: 'Heat wave conditions',
      level: 'HIGH',
      reason: `Temperatures are expected to reach about ${effective}°C${humidity >= 60 ? ` with ${humidity}% humidity` : ''}.`,
      advisory: 'Limit prolonged outdoor exposure in the afternoon, wear light clothing and stay hydrated.',
    };
  }
  if (effective >= 35) {
    return {
      type: 'Hot conditions',
      level: 'MODERATE',
      reason: `A daytime high near ${effective}°C is expected.`,
      advisory: 'Plan outdoor work for the early morning or evening and carry drinking water.',
    };
  }
  return null;
}

function coldRisk({ minTemp }) {
  const t = num(minTemp);
  if (t === null) return null;
  if (t <= 0) {
    return {
      type: 'Severe cold',
      level: 'HIGH',
      reason: `Minimum temperature near ${t}°C.`,
      advisory: 'Dress in layers, protect water pipes, and watch for icy surfaces early in the morning.',
    };
  }
  if (t <= 8) {
    return {
      type: 'Cold conditions',
      level: 'MODERATE',
      reason: `Minimum temperature near ${t}°C.`,
      advisory: 'Carry warm clothing for early mornings and late evenings.',
    };
  }
  return null;
}

function windRisk({ windSpeed, windGusts }) {
  const gust = Math.max(num(windGusts) ?? 0, num(windSpeed) ?? 0);
  if (gust >= 89) {
    return {
      type: 'Storm-force wind',
      level: 'SEVERE',
      reason: `Winds gusting to about ${gust} km/h are forecast.`,
      advisory: 'Secure loose objects, stay away from hoardings and old trees, and avoid two-wheeler travel.',
    };
  }
  if (gust >= 62) {
    return {
      type: 'Strong wind',
      level: 'HIGH',
      reason: `Winds gusting to about ${gust} km/h are forecast.`,
      advisory: 'Secure outdoor items and be careful on exposed roads, bridges and flyovers.',
    };
  }
  if (gust >= 40) {
    return {
      type: 'Gusty wind',
      level: 'MODERATE',
      reason: `Gusts near ${gust} km/h are forecast.`,
      advisory: 'Expect gusty conditions. Take care when riding two-wheelers and secure light outdoor items.',
    };
  }
  return null;
}

function uvRisk({ uvIndex }) {
  const uv = num(uvIndex);
  if (uv === null) return null;
  if (uv >= 11) {
    return {
      type: 'Extreme UV',
      level: 'HIGH',
      reason: `UV index is around ${uv}.`,
      advisory: 'Avoid the midday sun, use sunscreen, and cover exposed skin when outdoors.',
    };
  }
  if (uv >= 8) {
    return {
      type: 'Very high UV',
      level: 'MODERATE',
      reason: `UV index is around ${uv}.`,
      advisory: 'Use sunscreen and seek shade between 11 am and 3 pm.',
    };
  }
  return null;
}

function floodRisk({ rainfallMm, precipitationHours, rainfall3Day }) {
  const total = num(rainfall3Day) ?? num(rainfallMm) ?? 0;
  if (total >= 150 && (num(precipitationHours) ?? 0) >= 6) {
    return {
      type: 'Flood-related rainfall',
      level: 'SEVERE',
      reason: `About ${total} mm of rain is forecast over a short period, which can cause local flooding.`,
      advisory:
        'Avoid low-lying areas and stream crossings, keep emergency numbers handy, and follow instructions from local disaster authorities.',
    };
  }
  if (total >= 80) {
    return {
      type: 'Waterlogging likely',
      level: 'HIGH',
      reason: `Cumulative rainfall of about ${total} mm is forecast.`,
      advisory: 'Expect waterlogging in low-lying streets. Avoid basements and underpasses during heavy spells.',
    };
  }
  return null;
}

function visibilityRisk({ visibility, weatherCode }) {
  const v = num(visibility);
  const fogCode = [45, 48].includes(Number(weatherCode));
  if (v === null && !fogCode) return null;
  if ((v !== null && v <= 1000) || fogCode) {
    return {
      type: 'Low visibility',
      level: v !== null && v <= 500 ? 'HIGH' : 'MODERATE',
      reason: v === null ? 'Fog is forecast.' : `Visibility is around ${Math.round(v)} m.`,
      advisory: 'Drive slowly with low-beam headlights and keep extra distance from the vehicle ahead.',
    };
  }
  return null;
}

/**
 * @param {object} input normalised weather values
 * @returns {{level:string,type:string,reason:string,advisory:string,risks:Array,source:object,generatedAt:string}}
 */
function analyzeRisk(input = {}) {
  const data = {
    temperature: num(input.temperature),
    feelsLike: num(input.feelsLike),
    maxTemp: num(input.maxTemp ?? input.temperature),
    minTemp: num(input.minTemp),
    humidity: num(input.humidity),
    rainProbability: num(input.rainProbability) ?? 0,
    rainfallMm: num(input.rainfallMm ?? input.precipitation) ?? 0,
    rainfall3Day: num(input.rainfall3Day),
    precipitationHours: num(input.precipitationHours),
    windSpeed: num(input.windSpeed) ?? 0,
    windGusts: num(input.windGusts) ?? 0,
    weatherCode: input.weatherCode,
    uvIndex: num(input.uvIndex ?? input.uvIndexMax),
    visibility: num(input.visibility),
  };

  const risks = [
    rainfallRisk(data),
    thunderstormRisk(data),
    floodRisk(data),
    heatRisk(data),
    coldRisk(data),
    windRisk(data),
    uvRisk(data),
    visibilityRisk(data),
  ].filter(Boolean);

  risks.sort((a, b) => levelValue(b.level) - levelValue(a.level));

  const top = risks[0] || {
    type: 'No significant weather risk',
    level: 'LOW',
    reason: 'Forecast values stay within normal ranges for rainfall, temperature and wind.',
    advisory: 'Normal outdoor activity is fine. Keep an eye on updates if plans run late into the day.',
  };

  const overall = risks.reduce((acc, r) => maxLevel(acc, r.level), 'LOW');

  return {
    level: overall,
    type: top.type,
    reason: top.reason,
    advisory: top.advisory,
    risks,
    sourceType: 'weathergpt',
    source: 'WeatherGPT Risk Assessment',
    disclaimer:
      'This is an automated assessment generated by WeatherGPT from Open-Meteo forecast data. It is not an official government warning.',
    generatedAt: new Date().toISOString(),
  };
}

/** Convenience wrapper: build the risk input from current + daily payloads. */
function analyzeFromForecast({ current, daily, hourly }) {
  const today = daily?.days?.[0] || {};
  const next3 = (daily?.days || []).slice(0, 3).reduce((sum, d) => sum + (Number(d.precipitationSum) || 0), 0);
  const peakGust = (hourly?.hours || []).reduce((m, h) => Math.max(m, Number(h.windGusts) || 0), 0);

  return analyzeRisk({
    temperature: current?.temperature,
    feelsLike: current?.feelsLike,
    maxTemp: today.maxTemp ?? current?.maxTemp,
    minTemp: today.minTemp ?? current?.minTemp,
    humidity: current?.humidity,
    rainProbability: Math.max(Number(today.rainProbability) || 0, Number(current?.rainProbability) || 0),
    rainfallMm: today.precipitationSum ?? current?.precipitation,
    rainfall3Day: Number(next3.toFixed(2)),
    precipitationHours: today.precipitationHours,
    windSpeed: Math.max(Number(current?.windSpeed) || 0, Number(today.windSpeedMax) || 0),
    windGusts: Math.max(Number(current?.windGusts) || 0, Number(today.windGustsMax) || 0, peakGust),
    weatherCode: today.weatherCode ?? current?.weatherCode,
    uvIndex: current?.uvIndexMax ?? today.uvIndexMax ?? current?.uvIndex,
    visibility: current?.visibility,
  });
}

module.exports = { analyzeRisk, analyzeFromForecast, LEVELS };
