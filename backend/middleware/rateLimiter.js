const rateLimit = require('express-rate-limit');

const message = (text) => ({ success: false, message: text });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many requests. Wait a minute and try again.'),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: message('Too many attempts from this device. Try again in 15 minutes.'),
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('You are sending questions very quickly. Wait a few seconds.'),
});

module.exports = { apiLimiter, authLimiter, chatLimiter };
