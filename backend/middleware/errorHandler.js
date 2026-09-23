const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(ApiError.notFound(`No API route matches ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong on our side';
  let details = err.details || null;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = 'Some fields need fixing';
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use';
    details = Object.keys(err.keyValue || {}).map((field) => ({ field, message: `${field} already exists` }));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'That identifier is not valid';
  } else if (err.name === 'MongooseError' || err.name === 'MongoNetworkError') {
    status = 503;
    message = 'The database is unreachable right now. Try again in a moment.';
  }

  if (status >= 500) logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  else logger.debug(`${req.method} ${req.originalUrl} -> ${status} ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    // Stack traces stay in the terminal in production.
    ...(env.isProduction ? {} : { stack: status >= 500 ? err.stack : undefined }),
  });
}

module.exports = { errorHandler, notFound };
