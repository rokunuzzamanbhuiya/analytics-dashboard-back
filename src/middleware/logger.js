/**
 * Logging Middleware
 */

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.path}`, {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    
    console.log(`${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorLogger = (err, req, res, next) => {
  console.error('🚨 Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  next(err);
};

/**
 * Simple console logger utility
 */
const logger = {
  info: (message, data = {}) => {
    console.log(`ℹ️ ${message}`, data);
  },
  
  warn: (message, data = {}) => {
    console.warn(`⚠️ ${message}`, data);
  },
  
  error: (message, data = {}) => {
    console.error(`❌ ${message}`, data);
  },
  
  success: (message, data = {}) => {
    console.log(`✅ ${message}`, data);
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, data);
    }
  }
};

module.exports = {
  requestLogger,
  errorLogger,
  logger
};
