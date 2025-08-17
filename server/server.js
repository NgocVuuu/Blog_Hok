// Load environment variables FIRST
const dotenv = require('dotenv');
const path = require('path');
// Try server/.env first, then fallback to repo root .env
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');
const envLoaded = dotenv.config({ path: serverEnvPath });
if (envLoaded.error) {
  dotenv.config({ path: rootEnvPath });
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
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
logger.info('Checkpoint: invoking connectDB');
connectDB();
logger.info('Checkpoint: connectDB call returned (async connection in progress)');

// Wrap route registration to catch any synchronous exception causing silent exit
try {
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
  app.use('/api/contact', require('./routes/contact'));
} catch (routeErr) {
  console.error('Synchronous route setup error:', routeErr);
  logger.error('Route setup error', { message: routeErr.message, stack: routeErr.stack });
  process.exit(1);
}

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

// Dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 7000}`;

    // Lazy import models to avoid circular deps during startup
    const Hero = require('./models/Hero');
    const News = require('./models/News');

    // Fetch slugs and timestamps (lean for perf)
    const [heroes, news] = await Promise.all([
      Hero.find({}, { slug: 1, updatedAt: 1, createdAt: 1 }).lean(),
      News.find({}, { slug: 1, publishedAt: 1, createdAt: 1 }).lean()
    ]);

    // Helpers
    const fmt = (d) => new Date(d).toISOString();
    const url = (loc, lastmod, changefreq = 'daily', priority = '0.7') =>
      `  <url>\n    <loc>${loc}</loc>\n    ${lastmod ? `<lastmod>${fmt(lastmod)}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

    const staticUrls = [
      url(`${baseUrl}/`, new Date(), 'daily', '1.0'),
      url(`${baseUrl}/heroes`, new Date(), 'daily', '0.9'),
      url(`${baseUrl}/equipment`, new Date(), 'weekly', '0.6'),
      url(`${baseUrl}/arcana`, new Date(), 'weekly', '0.6'),
      url(`${baseUrl}/news`, new Date(), 'daily', '0.7')
    ];

    const heroUrls = (heroes || [])
      .filter(h => h && h.slug)
      .map(h => url(`${baseUrl}/heroes/${h.slug}`, h.updatedAt || h.createdAt || new Date(), 'weekly', '0.8'));

    const newsUrls = (news || [])
      .filter(n => n && n.slug)
      .map(n => url(`${baseUrl}/news/${n.slug}`, n.publishedAt || n.createdAt || new Date(), 'daily', '0.8'));

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticUrls,
      ...heroUrls,
      ...newsUrls,
      '</urlset>'
    ].join('\n');

    res.header('Content-Type', 'application/xml');
    res.send(body);
  } catch (err) {
    next(err);
  }
});

// Compatibility: also serve sitemap under /api path
app.get('/api/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 7000}`;
    const Hero = require('./models/Hero');
    const News = require('./models/News');
    const [heroes, news] = await Promise.all([
      Hero.find({}, { slug: 1, updatedAt: 1, createdAt: 1 }).lean(),
      News.find({}, { slug: 1, publishedAt: 1, createdAt: 1 }).lean()
    ]);
    const fmt = (d) => new Date(d).toISOString();
    const url = (loc, lastmod, changefreq = 'daily', priority = '0.7') =>
      `  <url>\n    <loc>${loc}</loc>\n    ${lastmod ? `<lastmod>${fmt(lastmod)}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    const staticUrls = [
      url(`${baseUrl}/`, new Date(), 'daily', '1.0'),
      url(`${baseUrl}/heroes`, new Date(), 'daily', '0.9'),
      url(`${baseUrl}/equipment`, new Date(), 'weekly', '0.6'),
      url(`${baseUrl}/arcana`, new Date(), 'weekly', '0.6'),
      url(`${baseUrl}/news`, new Date(), 'daily', '0.7')
    ];
    const heroUrls = (heroes || [])
      .filter(h => h && h.slug)
      .map(h => url(`${baseUrl}/heroes/${h.slug}`, h.updatedAt || h.createdAt || new Date(), 'weekly', '0.8'));
    const newsUrls = (news || [])
      .filter(n => n && n.slug)
      .map(n => url(`${baseUrl}/news/${n.slug}`, n.publishedAt || n.createdAt || new Date(), 'daily', '0.8'));
    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticUrls,
      ...heroUrls,
      ...newsUrls,
      '</urlset>'
    ].join('\n');
    res.header('Content-Type', 'application/xml');
    res.send(body);
  } catch (err) {
    next(err);
  }
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

// Graceful shutdown handling (Mongoose v7 compatible)
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  const timeoutMs = parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT) || 30000;
  const timeout = setTimeout(() => {
    logger.error('Force shutdown after timeout');
    process.exit(1);
  }, timeoutMs);
  try {
    // Close HTTP server
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    logger.info('HTTP server closed');

    // Close Mongo connection if open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
    clearTimeout(timeout);
    process.exit(0);
  } catch (err) {
    logger.error('Graceful shutdown error', { error: { message: err.message, stack: err.stack } });
    clearTimeout(timeout);
    process.exit(1);
  }
};

// Simple internal ping for debugging
app.get('/_ping', (req, res) => res.json({ ok: true, time: Date.now() }));

// Start server
const PORT = process.env.PORT || 7000;
console.log('DEBUG before listen reached');
logger.info('Checkpoint: about to listen', { port: PORT });
let server;
try {
  server = app.listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    });
  });
  server.on('error', (err) => {
    logger.error('Server listen error', { message: err.message, stack: err.stack });
  });
} catch (err) {
  logger.error('Listen threw synchronously', { message: err.message, stack: err.stack });
  process.exit(1);
}

process.on('beforeExit', (code) => {
  logger.warn('Process beforeExit', { code });
});
process.on('exit', (code) => {
  logger.warn('Process exit', { code });
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