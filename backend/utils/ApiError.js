class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Invalid request', details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'You need to sign in to do that') { return new ApiError(401, msg); }
  static forbidden(msg = 'You do not have access to this resource') { return new ApiError(403, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static conflict(msg = 'That already exists') { return new ApiError(409, msg); }
  static unavailable(msg = 'Service temporarily unavailable') { return new ApiError(503, msg); }
}

module.exports = ApiError;
