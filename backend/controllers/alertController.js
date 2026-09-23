const alertService = require('../services/alertService');
const geocodingService = require('../services/geocodingService');
const weatherService = require('../services/weatherService');
const Alert = require('../models/Alert');
const { isDBConnected } = require('../config/db');
const ApiError = require('../utils/ApiError');

async function buildResponse(lat, lon, location) {
  const alerts = await alertService.getAlerts(lat, lon, location || {});

  // Alerts stored in MongoDB (for example seeded demo alerts) are merged in,
  // keeping their own source labels.
  let stored = [];
  if (isDBConnected()) {
    stored = await Alert.find({
      'location.latitude': { $gte: lat - 0.6, $lte: lat + 0.6 },
      'location.longitude': { $gte: lon - 0.6, $lte: lon + 0.6 },
      $or: [{ validUntil: null }, { validUntil: { $gte: new Date() } }],
    }).lean();
  }

  return {
    location: location || { latitude: lat, longitude: lon },
    official: alerts.official,
    generated: alerts.generated,
    stored: stored.map((a) => ({
      id: String(a._id),
      type: a.type,
      severity: a.severity,
      headline: a.type,
      description: a.description,
      advisory: a.advisory,
      validFrom: a.validFrom,
      validUntil: a.validUntil,
      sourceType: a.sourceType,
      source: a.source,
      sourceUrl: a.sourceUrl,
    })),
    officialCoverage: alerts.officialCoverage,
    checkedAt: alerts.checkedAt,
    labels: {
      official: 'Official Weather Alert',
      weathergpt: 'WeatherGPT Risk Assessment',
    },
  };
}

/** GET /api/alerts?lat=&lon= */
async function list(req, res, next) {
  try {
    const { lat, lon } = req.query;
    if (lat === undefined || lon === undefined) {
      throw ApiError.badRequest('Provide lat and lon, or use /api/alerts/:location');
    }
    const c = weatherService.assertCoords(lat, lon);
    const location = req.query.name
      ? { name: req.query.name, latitude: c.lat, longitude: c.lon }
      : await geocodingService.reverseGeocode(c.lat, c.lon).catch(() => null);
    res.json({ success: true, data: await buildResponse(c.lat, c.lon, location) });
  } catch (err) { next(err); }
}

/** GET /api/alerts/:location  (place name) */
async function byLocation(req, res, next) {
  try {
    const location = await geocodingService.resolveLocation(req.params.location);
    res.json({ success: true, data: await buildResponse(location.latitude, location.longitude, location) });
  } catch (err) { next(err); }
}

module.exports = { list, byLocation };
