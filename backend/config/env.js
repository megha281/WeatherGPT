const path = require('path');

try {
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (err) {
  // dotenv is only missing before `npm install`; process.env still works.
  console.warn('[env] dotenv not installed yet - reading process.env only. Run "npm install" inside /backend.');
}

const bool = (v, fallback = false) =>
  v === undefined ? fallback : String(v).toLowerCase() === 'true';

const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weathergpt',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'WeatherGPT <no-reply@weathergpt.local>',
  EXPOSE_DEV_TOKENS: bool(process.env.EXPOSE_DEV_TOKENS, true),
};

env.isProduction = env.NODE_ENV === 'production';
env.emailConfigured = Boolean(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD);
env.geminiConfigured = Boolean(env.GEMINI_API_KEY);

if (!env.JWT_SECRET) {
  if (env.isProduction) {
    throw new Error('JWT_SECRET must be set in production. See backend/.env.example');
  }
  env.JWT_SECRET = 'weathergpt-development-secret-change-me';
  // eslint-disable-next-line no-console
  console.warn('[env] JWT_SECRET missing - using an insecure development secret.');
}

module.exports = env;
