const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { logger } = require('../utils/logger');

// Health check status
let healthStatus = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  checks: {}
};

// Database health check
const checkDatabase = async () => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const duration = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${duration}ms`,
      connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Memory health check
const checkMemory = () => {
  const usage = process.memoryUsage();
  const totalMemory = usage.rss + usage.heapTotal + usage.external;
  const maxMemory = 512 * 1024 * 1024; // 512MB threshold
  
  return {
    status: totalMemory > maxMemory ? 'warning' : 'healthy',
    usage: {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      total: `${Math.round(totalMemory / 1024 / 1024)}MB`
    },
    threshold: `${Math.round(maxMemory / 1024 / 1024)}MB`
  };
};

// Disk space health check
const checkDiskSpace = () => {
  try {
    const fs = require('fs');
    const stats = fs.statSync('./');
    
    return {
      status: 'healthy',
      available: 'N/A' // Would need additional package for actual disk space
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// External services health check
const checkExternalServices = async () => {
  const checks = {};

  // Check Cloudinary (if configured) - TEMPORARILY DISABLED
  // if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  //   try {
  //     const cloudinary = require('cloudinary').v2;
  //     const start = Date.now();
  //     await cloudinary.api.ping();
  //     const duration = Date.now() - start;

  //     checks.cloudinary = {
  //       status: 'healthy',
  //       responseTime: `${duration}ms`
  //     };
  //   } catch (error) {
  //     checks.cloudinary = {
  //       status: 'unhealthy',
  //       error: error.message
  //     };
  //   }
  // }

  return checks;
};

// Comprehensive health check
const performHealthCheck = async () => {
  const start = Date.now();
  
  try {
    const [database, externalServices] = await Promise.all([
      checkDatabase(),
      checkExternalServices()
    ]);
    
    const memory = checkMemory();
    const disk = checkDiskSpace();
    
    const checks = {
      database,
      memory,
      disk,
      ...externalServices
    };
    
    // Determine overall status
    const hasUnhealthy = Object.values(checks).some(check => check.status === 'unhealthy');
    const hasWarning = Object.values(checks).some(check => check.status === 'warning');
    
    let overallStatus = 'healthy';
    if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasWarning) {
      overallStatus = 'warning';
    }
    
    const duration = Date.now() - start;
    
    healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${duration}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      checks
    };
    
    return healthStatus;
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message,
      checks: {}
    };
    
    return healthStatus;
  }
};

// Basic health endpoint
router.get('/', async (req, res) => {
  try {
    const health = await performHealthCheck();

    const statusCode = health.status === 'healthy' ? 200 :
                      health.status === 'warning' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health endpoint
router.get('/detailed', async (req, res) => {
  try {
    const health = await performHealthCheck();
    
    // Add additional system information
    const detailed = {
      ...health,
      system: {
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage(),
        pid: process.pid,
        ppid: process.ppid
      },
      database: {
        ...health.checks.database,
        collections: mongoose.connection.db ? 
          await mongoose.connection.db.listCollections().toArray() : []
      }
    };
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;
    
    res.status(statusCode).json(detailed);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness probe (simple check)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Readiness probe (checks if app is ready to serve traffic)
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'database not connected',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint (basic metrics)
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      eventLoop: {
        // Would need additional package for event loop metrics
        lag: 'N/A'
      },
      requests: {
        // Would need to implement request counting
        total: 'N/A',
        active: 'N/A'
      }
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Periodic health check (run every 30 seconds)
setInterval(async () => {
  try {
    await performHealthCheck();
    
    if (healthStatus.status === 'unhealthy') {
      logger.error('Health check failed', healthStatus);
    } else if (healthStatus.status === 'warning') {
      logger.warn('Health check warning', healthStatus);
    }
  } catch (error) {
    logger.error('Periodic health check error', { error: error.message });
  }
}, 30000);

module.exports = router;
