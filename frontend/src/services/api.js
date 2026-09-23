import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const TOKEN_KEY = 'weathergpt.token';

const api = axios.create({ baseURL, timeout: 45000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'That took too long. Check your connection and try again.'
        : !error.response
          ? 'Cannot reach the WeatherGPT server. Make sure the backend is running on port 5000.'
          : 'Something went wrong. Try again.');

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      // Let the app know the session ended so it can redirect.
      window.dispatchEvent(new CustomEvent('weathergpt:signed-out'));
    }

    return Promise.reject({ status, message, details: error.response?.data?.details || null, raw: error });
  }
);

export default api;
