const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { isDBConnected } = require('../config/db');

function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

/** Rejects the request unless a valid JWT is present. */
async function protect(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) throw ApiError.unauthorized('Sign in to continue');
    if (!isDBConnected()) throw ApiError.unavailable('The database is unreachable, so accounts are unavailable right now');

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw err.name === 'TokenExpiredError'
        ? ApiError.unauthorized('Your session has expired. Sign in again.')
        : ApiError.unauthorized('Your session is not valid. Sign in again.');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('This account no longer exists');

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Attaches req.user when a token is present, but never blocks the request. */
async function optionalAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (token && isDBConnected()) {
      const payload = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(payload.sub);
    }
  } catch {
    req.user = null;
  }
  return next();
}

module.exports = { protect, optionalAuth, signToken };
