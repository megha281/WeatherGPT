const axios = require('axios');
const cache = require('./cache');
const logger = require('../utils/logger');
const weatherService = require('./weatherService');
const { analyzeRisk } = require('./riskEngine');

const http = axios.create({ timeout: 10000, headers: { 'User-Agent': 'WeatherGPT/1.0' } });

/**
 * Official alerts.
 *
 * Open-Meteo does not distribute government warnings. The US National Weather
 * Service publishes a free, key-less alerts feed, so we use it where it has
 * coverage. Anywhere else we return an empty official list and say so, rather
 * than presenting our own assessment as a government warning.
 */
async function getOfficialAlerts(latitude, longitude) {
  const key = `official:${Number(latitude).toFixed(2)}:${Number(longitude).toFixed(2)}`;
  return cache.wrap(key, 600, async () => {
    try {
      const { data } = await http.get('https://api.weather.gov/alerts/active', {
        params: { point: `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}` },
      });
      const features = Array.isArray(data?.features) ? data.features : [];
      return features.map((f) => {
        const p = f.properties || {};
        const severityMap = { Extreme: 'SEVERE', Severe: 'SEVERE', Moderate: 'HIGH', Minor: 'MODERATE', Unknown: 'MODERATE' };
        return {
          id: p.id,
          type: p.event || 'Weather alert',
          severity: severityMap[p.severity] || 'MODERATE',
          headline: p.headline || p.event,
          description: (p.description || '').slice(0, 1200),
          advisory: (p.instruction || '').slice(0, 800),
          area: p.areaDesc || '',
          validFrom: p.effective || p.onset || null,
          validUntil: p.expires || p.ends || null,
          sourceType: 'official',
          source: p.senderName || 'US National Weather Service',
          sourceUrl: 'https://www.weather.gov',
        };
      });
    } catch (err) {
      // No coverage for this point, or the service is down: not an error for the user.
      logger.debug(`Official alert lookup returned nothing usable: ${err.message}`);
      return [];
    }
  });
}

/**
 * WeatherGPT risk assessments derived from the forecast by the deterministic
 * engine. Always labelled as our own assessment, never as an official warning.
 */
async function getGeneratedAlerts(latitude, longitude, location = {}) {
  const daily = await weatherService.getDailyForecast(latitude, longitude, { days: 5 });
  const alerts = [];

  daily.days.forEach((day, index) => {
    const risk = analyzeRisk({
      maxTemp: day.maxTemp,
      minTemp: day.minTemp,
      rainProbability: day.rainProbability,
      rainfallMm: day.precipitationSum,
      precipitationHours: day.precipitationHours,
      windSpeed: day.windSpeedMax,
      windGusts: day.windGustsMax,
      weatherCode: day.weatherCode,
      uvIndex: day.uvIndexMax,
    });

    if (risk.level === 'LOW') return;

    alerts.push({
      id: `wgpt-${day.date}-${risk.type.replace(/\s+/g, '-').toLowerCase()}`,
      type: risk.type,
      severity: risk.level,
      headline: `${risk.type} expected ${index === 0 ? 'today' : `on ${day.date}`}`,
      description: risk.reason,
      advisory: risk.advisory,
      area: location.label || location.name || '',
      location: {
        name: location.name || '',
        city: location.city || '',
        state: location.state || '',
        country: location.country || '',
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      validFrom: `${day.date}T00:00:00`,
      validUntil: `${day.date}T23:59:59`,
      sourceType: 'weathergpt',
      source: 'WeatherGPT Risk Assessment',
      sourceUrl: '',
      basedOn: { provider: 'Open-Meteo', date: day.date },
      allRisks: risk.risks,
    });
  });

  return alerts;
}

async function getAlerts(latitude, longitude, location = {}) {
  const [official, generated] = await Promise.all([
    getOfficialAlerts(latitude, longitude).catch(() => []),
    getGeneratedAlerts(latitude, longitude, location),
  ]);

  return {
    official,
    generated,
    officialCoverage: official.length > 0
      ? 'Official warnings are available for this location.'
      : 'No official warning feed is available for this location in this build. Check your national meteorological service (in India, mausam.imd.gov.in) for authoritative warnings.',
    counts: { official: official.length, generated: generated.length },
    checkedAt: new Date().toISOString(),
  };
}

module.exports = { getAlerts, getOfficialAlerts, getGeneratedAlerts };
