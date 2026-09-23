const axios = require('axios');
const cache = require('./cache');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const http = axios.create({ timeout: 10000 });

function normalise(result) {
  return {
    id: result.id,
    name: result.name,
    city: result.name,
    state: result.admin1 || '',
    district: result.admin2 || '',
    country: result.country || '',
    countryCode: result.country_code || '',
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || 'auto',
    population: result.population || null,
    elevation: result.elevation ?? null,
    label: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
  };
}

/**
 * Search cities / towns / districts by name (Open-Meteo geocoding API).
 */
async function searchLocations(query, { count = 8, language = 'en' } = {}) {
  const q = String(query || '').trim();
  if (q.length < 2) throw ApiError.badRequest('Type at least two characters to search for a place');

  const key = `geo:${language}:${count}:${q.toLowerCase()}`;
  return cache.wrap(key, 60 * 60 * 12, async () => {
    try {
      const { data } = await http.get(GEOCODE_URL, {
        params: { name: q, count, language, format: 'json' },
      });
      if (!data || !Array.isArray(data.results) || data.results.length === 0) return [];
      return data.results.map(normalise);
    } catch (err) {
      logger.error(`Geocoding failed for "${q}": ${err.message}`);
      throw ApiError.unavailable('Location search is unavailable right now. Please try again shortly.');
    }
  });
}

/**
 * Resolve a free-text place name to a single location, or throw a clear 404.
 */
async function resolveLocation(query, options = {}) {
  const results = await searchLocations(query, { ...options, count: 5 });
  if (!results.length) {
    throw ApiError.notFound(`I could not find a place called "${query}". Try a nearby city or district name.`);
  }
  return results[0];
}

/**
 * Coordinates -> readable place name. Used by "use my location".
 */
async function reverseGeocode(latitude, longitude) {
  const key = `rgeo:${Number(latitude).toFixed(3)}:${Number(longitude).toFixed(3)}`;
  return cache.wrap(key, 60 * 60 * 24, async () => {
    try {
      const { data } = await http.get(REVERSE_URL, {
        params: { latitude, longitude, localityLanguage: 'en' },
      });
      const name = data.city || data.locality || data.principalSubdivision || 'Selected location';
      return {
        name,
        city: data.city || data.locality || '',
        state: data.principalSubdivision || '',
        country: data.countryName || '',
        countryCode: data.countryCode || '',
        latitude: Number(latitude),
        longitude: Number(longitude),
        label: [name, data.principalSubdivision, data.countryName].filter(Boolean).join(', '),
      };
    } catch (err) {
      logger.warn(`Reverse geocoding failed: ${err.message}`);
      // Coordinates are still real data, so return them rather than inventing a name.
      return {
        name: 'Selected location',
        city: '',
        state: '',
        country: '',
        latitude: Number(latitude),
        longitude: Number(longitude),
        label: `${Number(latitude).toFixed(3)}, ${Number(longitude).toFixed(3)}`,
      };
    }
  });
}

module.exports = { searchLocations, resolveLocation, reverseGeocode };
