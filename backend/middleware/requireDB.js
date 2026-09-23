const { isDBConnected } = require('../config/db');
const ApiError = require('../utils/ApiError');

/** Guards routes that cannot work without MongoDB, with a clear message. */
function requireDB(req, res, next) {
  if (isDBConnected()) return next();
  return next(
    ApiError.unavailable(
      'The database is not connected. Check MONGODB_URI in backend/.env and that MongoDB is running.'
    )
  );
}

module.exports = { requireDB };
