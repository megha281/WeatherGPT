const weatherService = require('../services/weatherService');
const { analyzeRisk, analyzeFromForecast } = require('../services/riskEngine');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/risk/analyze
 * Body: { latitude, longitude }  -> analyse the live forecast
 *    or { weather: {...} }       -> analyse values you supply (used by tests)
 */
async function analyze(req, res, next) {
  try {
    const { latitude, longitude, weather } = req.body || {};

    if (weather && typeof weather === 'object') {
      return res.json({ success: true, data: analyzeRisk(weather), input: 'provided-values' });
    }

    if (latitude === undefined || longitude === undefined) {
      throw ApiError.badRequest('Send latitude and longitude, or a weather object to analyse');
    }

    const { lat, lon } = weatherService.assertCoords(latitude, longitude);
    const [current, daily, hourly] = await Promise.all([
      weatherService.getCurrentWeather(lat, lon),
      weatherService.getDailyForecast(lat, lon, { days: 3 }),
      weatherService.getHourlyForecast(lat, lon, { hours: 24 }),
    ]);

    return res.json({
      success: true,
      data: analyzeFromForecast({ current, daily, hourly }),
      input: 'open-meteo-forecast',
    });
  } catch (err) { return next(err); }
}

module.exports = { analyze };
