/**
 * Custom operational error class. Controllers throw this (via catchAsync ->
 * next(err)) and the global error handler middleware reads statusCode +
 * message to build the JSON error response.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
