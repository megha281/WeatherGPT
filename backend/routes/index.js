const express = require('express');
const env = require('../config/env');
const { isDBConnected } = require('../config/db');
const ragService = require('../services/ragService');
const cache = require('../services/cache');

const router = express.Router();

/** GET /api/health - quick check that everything is wired up. */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'WeatherGPT API',
    time: new Date().toISOString(),
    checks: {
      database: isDBConnected() ? 'connected' : 'disconnected',
      gemini: env.geminiConfigured ? 'configured' : 'missing GEMINI_API_KEY (rule-based mode)',
      email: env.emailConfigured ? 'configured' : 'console fallback',
      rag: ragService.getStatus(),
      cache: cache.stats(),
    },
  });
});

router.use('/auth', require('./authRoutes'));
router.use('/weather', require('./weatherRoutes'));
router.use('/location', require('./locationRoutes'));
router.use('/chat', require('./chatRoutes'));
router.use('/risk', require('./riskRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/climate', require('./climateRoutes'));
router.use('/user', require('./userRoutes'));

module.exports = router;
