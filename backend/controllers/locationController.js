const geocodingService = require('../services/geocodingService');
const ApiError = require('../utils/ApiError');

/** GET /api/location/search?q=bellary */
async function search(req, res, next) {
  try {
    const q = req.query.q || req.query.query || req.query.name;
    if (!q) throw ApiError.badRequest('Add a ?q= search term, for example /api/location/search?q=Bellary');
    const results = await geocodingService.searchLocations(q, {
      count: Math.min(10, parseInt(req.query.count || '8', 10)),
      language: req.query.language || 'en',
    });
    res.json({ success: true, count: results.length, results });
  } catch (err) { next(err); }
}

/** GET /api/location/reverse?lat=&lon= */
async function reverse(req, res, next) {
  try {
    const { lat, lon } = req.query;
    if (lat === undefined || lon === undefined) throw ApiError.badRequest('Provide lat and lon');
    const result = await geocodingService.reverseGeocode(lat, lon);
    res.json({ success: true, result });
  } catch (err) { next(err); }
}

module.exports = { search, reverse };
