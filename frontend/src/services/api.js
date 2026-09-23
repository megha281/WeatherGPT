import axios from 'axios';
import translations from '../i18n/translations';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const TOKEN_KEY = 'weathergpt.token';

const api = axios.create({ baseURL, timeout: 45000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const language = localStorage.getItem('weathergpt.language') || 'en';
  config.headers['Accept-Language'] = language;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const language = localStorage.getItem('weathergpt.language') || 'en';
    const local = translations[language] || translations.en;
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? local['errors.timeout']
        : !error.response
          ? local['errors.server']
          : local['errors.generic']);

    if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      // Let the app know the session ended so it can redirect.
      window.dispatchEvent(new CustomEvent('weathergpt:signed-out'));
    }

    return Promise.reject({ status, message, details: error.response?.data?.details || null, raw: error });
  }
);

export default api;
