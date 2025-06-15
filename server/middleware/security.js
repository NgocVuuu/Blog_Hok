const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting configurations
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { 
      success: false,
      error: message 
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimit(
  parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

const apiLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests
  'Too many API requests, please try again later'
);

const uploadLimiter = createRateLimit(
  parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10, // 10 uploads
  'Too many file uploads, please try again later'
);

const searchLimiter = createRateLimit(
  parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
  parseInt(process.env.SEARCH_RATE_LIMIT_MAX) || 30, // 30 searches
  'Too many search requests, please slow down'
);

// Token blacklist (in production, use Redis)
const blacklistedTokens = new Set();

// Enhanced JWT verification
const verifyToken = (token) => {
  if (blacklistedTokens.has(token)) {
    throw new Error('Token has been revoked');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Blacklist token
const blacklistToken = (token) => {
  blacklistedTokens.add(token);
  
  // Auto-remove expired tokens (cleanup)
  setTimeout(() => {
    blacklistedTokens.delete(token);
  }, parseInt(process.env.TOKEN_BLACKLIST_DURATION) || 24 * 60 * 60 * 1000); // 24 hours
};

// Enhanced auth middleware with better error handling
const enhancedAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.'
      });
    }
    
    try {
      const decoded = verifyToken(token);
      
      // Check if user still exists and has admin role
      const User = require('../models/User');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Access denied. User not found.'
        });
      }
      
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }
      
      req.user = user;
      req.token = token;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Access denied. Token expired.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Access denied. Invalid token.'
        });
      } else {
        return res.status(401).json({
          success: false,
          error: jwtError.message
        });
      }
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'https://bloghok-frontend.onrender.com',
      'https://blog-hok-fe.onrender.com',
      'https://blog-hok.onrender.com',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, log the rejected origin for debugging
      if (process.env.NODE_ENV === 'production') {
        console.log('CORS rejected origin:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large'
    });
  }
  
  next();
};

// IP whitelist for admin operations (optional)
const adminIPWhitelist = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const allowedIPs = (process.env.ADMIN_ALLOWED_IPS || '').split(',').filter(Boolean);
    
    if (allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!allowedIPs.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP address'
        });
      }
    }
  }
  
  next();
};

module.exports = {
  securityHeaders,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter,
  enhancedAuth,
  corsOptions,
  requestSizeLimiter,
  adminIPWhitelist,
  blacklistToken,
  verifyToken
};
