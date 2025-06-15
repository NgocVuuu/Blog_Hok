const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: {
    service: 'bloghok-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // Console output (only in development)
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: consoleFormat
      })
    ] : [])
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ]
});

// Add production-specific transports
if (process.env.NODE_ENV === 'production') {
  // Add external logging service here (e.g., Loggly, Papertrail, etc.)
  // logger.add(new winston.transports.Http({
  //   host: 'logs.example.com',
  //   port: 80,
  //   path: '/logs'
  // }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Request error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// Database operation logger
const dbLogger = {
  query: (operation, collection, query, duration) => {
    logger.debug('Database query', {
      operation,
      collection,
      query: JSON.stringify(query),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  },
  
  error: (operation, collection, error) => {
    logger.error('Database error', {
      operation,
      collection,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Security event logger
const securityLogger = {
  authAttempt: (email, success, ip, userAgent) => {
    logger.info('Authentication attempt', {
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  authFailure: (email, reason, ip, userAgent) => {
    logger.warn('Authentication failure', {
      email,
      reason,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: (activity, details, ip, userAgent) => {
    logger.warn('Suspicious activity detected', {
      activity,
      details,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  rateLimitExceeded: (ip, endpoint, userAgent) => {
    logger.warn('Rate limit exceeded', {
      ip,
      endpoint,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance logger
const performanceLogger = {
  slowQuery: (query, duration, collection) => {
    logger.warn('Slow database query detected', {
      query: JSON.stringify(query),
      duration: `${duration}ms`,
      collection,
      timestamp: new Date().toISOString()
    });
  },
  
  slowRequest: (method, url, duration, statusCode) => {
    logger.warn('Slow request detected', {
      method,
      url,
      duration: `${duration}ms`,
      statusCode,
      timestamp: new Date().toISOString()
    });
  },
  
  memoryUsage: () => {
    const usage = process.memoryUsage();
    logger.info('Memory usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      timestamp: new Date().toISOString()
    });
  }
};

// Log system startup
logger.info('Logger initialized', {
  level: logger.level,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  dbLogger,
  securityLogger,
  performanceLogger
};
