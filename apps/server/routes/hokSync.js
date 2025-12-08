const express = require('express');
const router = express.Router();
const { getScheduler } = require('../services/hokMetaScheduler');
const { logger } = require('../utils/logger');

/**
 * GET /api/hok-sync/status
 * Get the current status of HoK meta sync scheduler
 */
router.get('/status', (req, res) => {
    try {
        const scheduler = getScheduler(logger);
        const status = scheduler.getStatus();

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        logger.error('[HoK Sync API] Status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get scheduler status',
            error: error.message
        });
    }
});

/**
 * POST /api/hok-sync/trigger
 * Manually trigger HoK meta sync
 * Protected endpoint - should require admin auth in production
 */
router.post('/trigger', async (req, res) => {
    try {
        const scheduler = getScheduler(logger);

        // Check if already syncing
        if (scheduler.isSyncing) {
            return res.status(429).json({
                success: false,
                message: 'Sync already in progress. Please wait...'
            });
        }

        logger.info('[HoK Sync API] Manual sync triggered by:', req.ip);

        // Run sync asynchronously
        scheduler.runSync().catch(err => {
            logger.error('[HoK Sync API] Background sync error:', err);
        });

        // Return immediately
        res.json({
            success: true,
            message: 'Sync process started. Check /api/hok-sync/status for progress.',
            startedAt: new Date().toISOString()
        });

    } catch (error) {
        logger.error('[HoK Sync API] Trigger error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger sync',
            error: error.message
        });
    }
});

/**
 * POST /api/hok-sync/start
 * Start the cron scheduler (admin only)
 */
router.post('/start', (req, res) => {
    try {
        const scheduler = getScheduler(logger);

        if (scheduler.isRunning) {
            return res.status(400).json({
                success: false,
                message: 'Scheduler is already running'
            });
        }

        scheduler.start();

        res.json({
            success: true,
            message: 'Scheduler started successfully',
            status: scheduler.getStatus()
        });
    } catch (error) {
        logger.error('[HoK Sync API] Start error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start scheduler',
            error: error.message
        });
    }
});

/**
 * POST /api/hok-sync/stop
 * Stop the cron scheduler (admin only)
 */
router.post('/stop', (req, res) => {
    try {
        const scheduler = getScheduler(logger);

        if (!scheduler.isRunning) {
            return res.status(400).json({
                success: false,
                message: 'Scheduler is not running'
            });
        }

        scheduler.stop();

        res.json({
            success: true,
            message: 'Scheduler stopped successfully'
        });
    } catch (error) {
        logger.error('[HoK Sync API] Stop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to stop scheduler',
            error: error.message
        });
    }
});

module.exports = router;
