const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const heroesRouter = require('./routes/heroes');

// Import security middleware
const {
  securityHeaders,
  apiLimiter,
  corsOptions,
  requestSizeLimiter
} = require('./middleware/security');
const { sanitizeInput } = require('./middleware/validation');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware (apply early)
app.use(securityHeaders);
app.use(requestSizeLimiter);

// CORS with enhanced configuration
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize input to prevent NoSQL injection
app.use(sanitizeInput);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Import logging and health check
const { logger, requestLogger, errorLogger } = require('./utils/logger');

// Connect to MongoDB
connectDB();

// Request logging (before routes)
app.use(requestLogger);

// Health check routes (before other routes)
app.use('/health', require('./routes/health'));

// API Routes
app.use('/api/champions', require('./routes/heroes'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/runes', require('./routes/runes'));
app.use('/api/arcana', require('./routes/arcana'));
app.use('/api/meta', require('./routes/meta'));
app.use('/api/news', require('./routes/news'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/heroes', heroesRouter);

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route handler
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BlogHok API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: 'https://github.com/your-repo/bloghok'
    }
  });
});

// Error logging middleware (before error handler)
app.use(errorLogger);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  logger.error('Request error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip
    }
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Database Error',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connection
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after configured timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT) || 30000);
};

// Start server
const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason,
    promise: promise
  });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: {
      message: err.message,
      stack: err.stack
    }
  });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});