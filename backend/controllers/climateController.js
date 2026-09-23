const climateService = require('../services/climateService');
const geocodingService = require('../services/geocodingService');
const weatherService = require('../services/weatherService');
const ragService = require('../services/ragService');
const ApiError = require('../utils/ApiError');

/** GET /api/climate?lat=&lon=  or  /api/climate?place=Bellary */
async function get(req, res, next) {
  try {
    let location = null;
    let lat;
    let lon;

    if (req.query.place) {
      location = await geocodingService.resolveLocation(req.query.place);
      lat = location.latitude;
      lon = location.longitude;
    } else if (req.query.lat !== undefined && req.query.lon !== undefined) {
      ({ lat, lon } = weatherService.assertCoords(req.query.lat, req.query.lon));
      location = await geocodingService.reverseGeocode(lat, lon).catch(() => null);
    } else {
      throw ApiError.badRequest('Provide lat and lon, or ?place=CityName');
    }

    const climate = await climateService.getClimateInformation(lat, lon, {
      years: Math.min(20, Math.max(5, parseInt(req.query.years || '10', 10))),
    });

    const { results } = await ragService.search('difference between weather and climate normals', { topK: 2 });

    res.json({
      success: true,
      data: { location, ...climate, explainer: results.map((r) => ({ heading: r.heading, text: r.text, title: r.title })) },
    });
  } catch (err) { next(err); }
}

module.exports = { get };
