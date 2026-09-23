const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');
const ragService = require('./services/ragService');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    name: 'WeatherGPT API',
    description: 'Conversational AI for weather forecasting, alerts and climate information',
    docs: '/api/health',
  });
});

app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  await ragService.initRAG();

  const server = app.listen(env.PORT, () => {
    logger.info(`WeatherGPT API listening on http://localhost:${env.PORT}`);
    logger.info(`Frontend origin allowed: ${env.FRONTEND_URL}`);
    if (!env.geminiConfigured) {
      logger.warn('GEMINI_API_KEY is not set. Chat runs in rule-based mode using real Open-Meteo data.');
    }
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error(`Unhandled rejection: ${reason}`));
}

if (require.main === module) start();

module.exports = app;
