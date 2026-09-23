import api from './api';

export const weatherService = {
  searchLocations: (q) => api.get('/location/search', { params: { q } }).then((r) => r.data.results),
  reverseGeocode: (lat, lon) => api.get('/location/reverse', { params: { lat, lon } }).then((r) => r.data.result),

  current: (lat, lon, unit) => api.get('/weather/current', { params: { lat, lon, unit } }).then((r) => r.data.data),
  hourly: (lat, lon, hours = 24, unit) =>
    api.get('/weather/hourly', { params: { lat, lon, hours, unit } }).then((r) => r.data.data),
  daily: (lat, lon, days = 7, unit) =>
    api.get('/weather/daily', { params: { lat, lon, days, unit } }).then((r) => r.data.data),
  forecast: (lat, lon, name, unit) =>
    api.get('/weather/forecast', { params: { lat, lon, name, unit } }).then((r) => r.data.data),
  models: (lat, lon, days = 3) => api.get('/weather/models', { params: { lat, lon, days } }).then((r) => r.data),

  alerts: (lat, lon, name) => api.get('/alerts', { params: { lat, lon, name } }).then((r) => r.data.data),
  climate: (lat, lon, years = 10) => api.get('/climate', { params: { lat, lon, years } }).then((r) => r.data.data),
  analyzeRisk: (payload) => api.post('/risk/analyze', payload).then((r) => r.data.data),
};

export default weatherService;
