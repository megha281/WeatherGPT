const axios = require('axios');
const cache = require('./cache');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { describeWeatherCode } = require('../utils/weatherCodes');

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

const http = axios.create({ timeout: 12000 });

const CURRENT_FIELDS = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day',
  'precipitation', 'rain', 'showers', 'weather_code', 'cloud_cover',
  'pressure_msl', 'surface_pressure', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'precipitation_probability',
  'precipitation', 'rain', 'weather_code', 'wind_speed_10m', 'wind_gusts_10m',
  'wind_direction_10m', 'visibility', 'uv_index', 'cloud_cover',
].join(',');

const DAILY_FIELDS = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'apparent_temperature_max',
  'apparent_temperature_min', 'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum',
  'rain_sum', 'precipitation_hours', 'precipitation_probability_max',
  'wind_speed_10m_max', 'wind_gusts_10m_max', 'wind_direction_10m_dominant',
].join(',');

function assertCoords(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw ApiError.badRequest('latitude must be between -90 and 90');
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw ApiError.badRequest('longitude must be between -180 and 180');
  return { lat, lon };
}

async function fetchForecast(params, cacheKey, ttl = 600) {
  return cache.wrap(cacheKey, ttl, async () => {
    try {
      const { data } = await http.get(FORECAST_URL, { params });
      return data;
    } catch (err) {
      const reason = err.response?.data?.reason || err.message;
      logger.error(`Open-Meteo request failed: ${reason}`);
      throw ApiError.unavailable('Live weather data is unavailable right now. Please retry in a moment.');
    }
  });
}

const round = (v, digits = 1) =>
  v === null || v === undefined || Number.isNaN(Number(v))
    ? null
    : Number(Number(v).toFixed(digits));

/** Current conditions + today's sun times and UV maximum. */
async function getCurrentWeather(latitude, longitude, { temperatureUnit = 'celsius' } = {}) {
  const { lat, lon } = assertCoords(latitude, longitude);
  const params = {
    latitude: lat,
    longitude: lon,
    current: CURRENT_FIELDS,
    hourly: 'visibility,uv_index,precipitation_probability',
    daily: 'sunrise,sunset,uv_index_max,precipitation_probability_max,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: 1,
    temperature_unit: temperatureUnit,
  };
  const key = `current:${lat.toFixed(3)}:${lon.toFixed(3)}:${temperatureUnit}`;
  const data = await fetchForecast(params, key, 600);

  const c = data.current || {};
  const hourly = data.hourly || {};
  const nowIndex = Array.isArray(hourly.time)
    ? Math.max(0, hourly.time.findIndex((t) => new Date(t) >= new Date(c.time)))
    : 0;

  return {
    time: c.time,
    timezone: data.timezone,
    units: {
      temperature: data.current_units?.temperature_2m || '°C',
      wind: data.current_units?.wind_speed_10m || 'km/h',
      precipitation: data.current_units?.precipitation || 'mm',
      pressure: data.current_units?.pressure_msl || 'hPa',
    },
    temperature: round(c.temperature_2m),
    feelsLike: round(c.apparent_temperature),
    humidity: round(c.relative_humidity_2m, 0),
    precipitation: round(c.precipitation, 2),
    rain: round(c.rain, 2),
    rainProbability: round(hourly.precipitation_probability?.[nowIndex], 0),
    weatherCode: c.weather_code,
    condition: describeWeatherCode(c.weather_code).label,
    icon: describeWeatherCode(c.weather_code).icon,
    isDay: c.is_day === 1,
    cloudCover: round(c.cloud_cover, 0),
    pressure: round(c.pressure_msl, 0),
    windSpeed: round(c.wind_speed_10m),
    windGusts: round(c.wind_gusts_10m),
    windDirection: round(c.wind_direction_10m, 0),
    visibility: round(hourly.visibility?.[nowIndex], 0),
    uvIndex: round(hourly.uv_index?.[nowIndex], 1),
    uvIndexMax: round(data.daily?.uv_index_max?.[0], 1),
    maxTemp: round(data.daily?.temperature_2m_max?.[0]),
    minTemp: round(data.daily?.temperature_2m_min?.[0]),
    sunrise: data.daily?.sunrise?.[0] || null,
    sunset: data.daily?.sunset?.[0] || null,
    latitude: data.latitude,
    longitude: data.longitude,
    source: { name: 'Open-Meteo', url: 'https://open-meteo.com' },
  };
}

/** Next N hours (default 24), starting from the current hour. */
async function getHourlyForecast(latitude, longitude, { hours = 24, temperatureUnit = 'celsius' } = {}) {
  const { lat, lon } = assertCoords(latitude, longitude);
  const params = {
    latitude: lat,
    longitude: lon,
    hourly: HOURLY_FIELDS,
    timezone: 'auto',
    forecast_days: Math.min(7, Math.ceil(hours / 24) + 1),
    temperature_unit: temperatureUnit,
  };
  const key = `hourly:${lat.toFixed(3)}:${lon.toFixed(3)}:${params.forecast_days}:${temperatureUnit}`;
  const data = await fetchForecast(params, key, 900);

  const h = data.hourly || {};
  if (!Array.isArray(h.time)) throw ApiError.unavailable('Hourly forecast data is not available for this location.');

  const now = new Date();
  let start = h.time.findIndex((t) => new Date(t) >= new Date(now.getTime() - 60 * 60 * 1000));
  if (start < 0) start = 0;

  const slice = [];
  for (let i = start; i < Math.min(h.time.length, start + hours); i += 1) {
    slice.push({
      time: h.time[i],
      temperature: round(h.temperature_2m?.[i]),
      feelsLike: round(h.apparent_temperature?.[i]),
      humidity: round(h.relative_humidity_2m?.[i], 0),
      rainProbability: round(h.precipitation_probability?.[i], 0),
      precipitation: round(h.precipitation?.[i], 2),
      weatherCode: h.weather_code?.[i],
      condition: describeWeatherCode(h.weather_code?.[i]).label,
      icon: describeWeatherCode(h.weather_code?.[i]).icon,
      windSpeed: round(h.wind_speed_10m?.[i]),
      windGusts: round(h.wind_gusts_10m?.[i]),
      windDirection: round(h.wind_direction_10m?.[i], 0),
      uvIndex: round(h.uv_index?.[i], 1),
      cloudCover: round(h.cloud_cover?.[i], 0),
    });
  }

  return {
    timezone: data.timezone,
    units: { temperature: data.hourly_units?.temperature_2m || '°C', wind: data.hourly_units?.wind_speed_10m || 'km/h' },
    hours: slice,
    source: { name: 'Open-Meteo', url: 'https://open-meteo.com' },
  };
}

/** Daily forecast (default 7 days). */
async function getDailyForecast(latitude, longitude, { days = 7, temperatureUnit = 'celsius' } = {}) {
  const { lat, lon } = assertCoords(latitude, longitude);
  const params = {
    latitude: lat,
    longitude: lon,
    daily: DAILY_FIELDS,
    timezone: 'auto',
    forecast_days: Math.min(16, Math.max(1, days)),
    temperature_unit: temperatureUnit,
  };
  const key = `daily:${lat.toFixed(3)}:${lon.toFixed(3)}:${params.forecast_days}:${temperatureUnit}`;
  const data = await fetchForecast(params, key, 1800);

  const d = data.daily || {};
  if (!Array.isArray(d.time)) throw ApiError.unavailable('Daily forecast data is not available for this location.');

  const daysOut = d.time.map((date, i) => ({
    date,
    weatherCode: d.weather_code?.[i],
    condition: describeWeatherCode(d.weather_code?.[i]).label,
    icon: describeWeatherCode(d.weather_code?.[i]).icon,
    maxTemp: round(d.temperature_2m_max?.[i]),
    minTemp: round(d.temperature_2m_min?.[i]),
    feelsLikeMax: round(d.apparent_temperature_max?.[i]),
    feelsLikeMin: round(d.apparent_temperature_min?.[i]),
    sunrise: d.sunrise?.[i] || null,
    sunset: d.sunset?.[i] || null,
    uvIndexMax: round(d.uv_index_max?.[i], 1),
    precipitationSum: round(d.precipitation_sum?.[i], 2),
    rainSum: round(d.rain_sum?.[i], 2),
    precipitationHours: round(d.precipitation_hours?.[i], 0),
    rainProbability: round(d.precipitation_probability_max?.[i], 0),
    windSpeedMax: round(d.wind_speed_10m_max?.[i]),
    windGustsMax: round(d.wind_gusts_10m_max?.[i]),
    windDirection: round(d.wind_direction_10m_dominant?.[i], 0),
  }));

  return {
    timezone: data.timezone,
    units: { temperature: data.daily_units?.temperature_2m_max || '°C', wind: data.daily_units?.wind_speed_10m_max || 'km/h' },
    days: daysOut,
    source: { name: 'Open-Meteo', url: 'https://open-meteo.com' },
  };
}

/** Everything the dashboard needs in one round trip. */
async function getFullForecast(latitude, longitude, options = {}) {
  const [current, hourly, daily] = await Promise.all([
    getCurrentWeather(latitude, longitude, options),
    getHourlyForecast(latitude, longitude, { hours: 24, ...options }),
    getDailyForecast(latitude, longitude, { days: 7, ...options }),
  ]);
  return { current, hourly, daily };
}

/**
 * Compare the forecast models Open-Meteo exposes for this point.
 * If a model has no data for the location the entry is skipped -
 * we never invent model names or values.
 */
const MODELS = [
  { id: 'ecmwf_ifs025', label: 'ECMWF IFS (Europe)' },
  { id: 'gfs_seamless', label: 'GFS (NOAA, USA)' },
  { id: 'icon_seamless', label: 'ICON (DWD, Germany)' },
];

async function getModelComparison(latitude, longitude, { days = 3 } = {}) {
  const { lat, lon } = assertCoords(latitude, longitude);
  const key = `models:${lat.toFixed(2)}:${lon.toFixed(2)}:${days}`;
  return cache.wrap(key, 1800, async () => {
    const results = await Promise.all(
      MODELS.map(async (model) => {
        try {
          const { data } = await http.get(FORECAST_URL, {
            params: {
              latitude: lat,
              longitude: lon,
              daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
              timezone: 'auto',
              forecast_days: days,
              models: model.id,
            },
          });
          const d = data.daily || {};
          if (!Array.isArray(d.time) || d.temperature_2m_max?.every((v) => v === null)) return null;
          return {
            model: model.label,
            modelId: model.id,
            days: d.time.map((date, i) => ({
              date,
              maxTemp: round(d.temperature_2m_max?.[i]),
              minTemp: round(d.temperature_2m_min?.[i]),
              precipitationSum: round(d.precipitation_sum?.[i], 2),
              rainProbability: round(d.precipitation_probability_max?.[i], 0),
            })),
          };
        } catch (err) {
          logger.warn(`Model ${model.id} unavailable for ${lat},${lon}: ${err.message}`);
          return null;
        }
      })
    );
    return { models: results.filter(Boolean), source: { name: 'Open-Meteo', url: 'https://open-meteo.com' } };
  });
}

/** Historical daily data from the ERA5 reanalysis archive (used by the Climate page). */
async function getHistoricalDaily(latitude, longitude, startDate, endDate) {
  const { lat, lon } = assertCoords(latitude, longitude);
  const key = `archive:${lat.toFixed(2)}:${lon.toFixed(2)}:${startDate}:${endDate}`;
  return cache.wrap(key, 60 * 60 * 24, async () => {
    try {
      const { data } = await http.get(ARCHIVE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: startDate,
          end_date: endDate,
          daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum',
          timezone: 'auto',
        },
      });
      return data.daily || null;
    } catch (err) {
      logger.warn(`Historical archive request failed: ${err.message}`);
      throw ApiError.unavailable('Historical climate data is unavailable right now.');
    }
  });
}

module.exports = {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getFullForecast,
  getModelComparison,
  getHistoricalDaily,
  assertCoords,
};
