// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);

  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${err.message}`);

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    status: statusCode,
  };

  if (err.rateLimitReset) {
    response.rateLimitReset = err.rateLimitReset;
  }
  if (err.rateLimitRemaining !== undefined) {
    response.rateLimitRemaining = err.rateLimitRemaining;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

// 404 Route Not Found Handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
