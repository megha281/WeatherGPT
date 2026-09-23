const weatherService = require('../services/weatherService');
const geocodingService = require('../services/geocodingService');
const { analyzeFromForecast } = require('../services/riskEngine');
const ApiError = require('../utils/ApiError');

function coords(req) {
  const { lat, latitude, lon, lng, longitude } = req.query;
  const la = lat ?? latitude;
  const lo = lon ?? lng ?? longitude;
  if (la === undefined || lo === undefined) {
    throw ApiError.badRequest('Provide lat and lon query parameters, for example /api/weather/current?lat=15.14&lon=76.92');
  }
  return weatherService.assertCoords(la, lo);
}

const unit = (req) => (req.query.unit === 'fahrenheit' ? 'fahrenheit' : 'celsius');

/** GET /api/weather/current?lat=&lon= */
async function current(req, res, next) {
  try {
    const { lat, lon } = coords(req);
    const data = await weatherService.getCurrentWeather(lat, lon, { temperatureUnit: unit(req) });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

/** GET /api/weather/hourly?lat=&lon=&hours=24 */
async function hourly(req, res, next) {
  try {
    const { lat, lon } = coords(req);
    const data = await weatherService.getHourlyForecast(lat, lon, {
      hours: Math.min(120, parseInt(req.query.hours || '24', 10)),
      temperatureUnit: unit(req),
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

/** GET /api/weather/daily?lat=&lon=&days=7 */
async function daily(req, res, next) {
  try {
    const { lat, lon } = coords(req);
    const data = await weatherService.getDailyForecast(lat, lon, {
      days: Math.min(16, parseInt(req.query.days || '7', 10)),
      temperatureUnit: unit(req),
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

/** GET /api/weather/forecast?lat=&lon=  - everything the dashboard needs */
async function forecast(req, res, next) {
  try {
    const { lat, lon } = coords(req);
    const temperatureUnit = unit(req);
    const [full, place] = await Promise.all([
      weatherService.getFullForecast(lat, lon, { temperatureUnit }),
      req.query.name
        ? Promise.resolve({ name: req.query.name, latitude: lat, longitude: lon })
        : geocodingService.reverseGeocode(lat, lon).catch(() => null),
    ]);
    const risk = analyzeFromForecast(full);
    res.json({ success: true, data: { location: place, ...full, risk } });
  } catch (err) { next(err); }
}

/** GET /api/weather/models?lat=&lon=&days=3 */
async function models(req, res, next) {
  try {
    const { lat, lon } = coords(req);
    const data = await weatherService.getModelComparison(lat, lon, {
      days: Math.min(7, parseInt(req.query.days || '3', 10)),
    });
    res.json({
      success: true,
      data,
      note: data.models.length
        ? 'Values are each model\u2019s own forecast for this point. Disagreement means lower confidence.'
        : 'No alternative model data is published for this point.',
    });
  } catch (err) { next(err); }
}

module.exports = { current, hourly, daily, forecast, models };
