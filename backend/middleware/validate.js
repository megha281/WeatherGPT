const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** Turns express-validator output into one consistent 400 response. */
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array().map((e) => ({ field: e.path || e.param, message: e.msg }));
  return next(ApiError.badRequest(details[0].message, details));
}

module.exports = { validate };
