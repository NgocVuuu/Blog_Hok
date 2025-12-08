const cron = require('node-cron');
const { fetchAndSync } = require('./hokAutoFetcher');

/**
 * Cron Job Scheduler for automated HoK meta sync
 * 
 * Schedules:
 * - Every Friday at 6:00 AM (Vietnam time)
 * - Can also run manual sync via trigger
 */
class HoKMetaSyncScheduler {
    constructor(logger = console) {
        this.logger = logger;
        this.jobs = [];
        this.isRunning = false;
        this.lastRun = null;
        this.lastResult = null;
    }

    /**
     * Start the cron job
     * Runs every Friday at 6:00 AM (Vietnam time UTC+7)
     * Cron expression: '0 6 * * 5'
     * - Minute: 0
     * - Hour: 6
     * - Day of month: * (any)
     * - Month: * (any)
     * - Day of week: 5 (Friday, 0=Sunday, 1=Monday, ..., 5=Friday)
     */
    start() {
        if (this.isRunning) {
            this.logger.warn('[HoK Scheduler] Already running');
            return;
        }

        this.logger.info('[HoK Scheduler] Starting automated meta sync scheduler...');
        this.logger.info('[HoK Scheduler] Schedule: Every Friday at 6:00 AM (Vietnam time)');

        // Main cron job: Every Friday at 6:00 AM
        const mainJob = cron.schedule('0 6 * * 5', async () => {
            this.logger.info('[HoK Scheduler] ⏰ Scheduled sync triggered!');
            await this.runSync();
        }, {
            scheduled: true,
            timezone: 'Asia/Ho_Chi_Minh'
        });

        this.jobs.push({ name: 'weekly-sync', job: mainJob });

        // Optional: Add a daily check at 6 AM for testing (comment out in production)
        // const dailyJob = cron.schedule('0 6 * * *', async () => {
        //   this.logger.info('[HoK Scheduler] Daily sync check triggered');
        //   await this.runSync();
        // }, {
        //   scheduled: true,
        //   timezone: 'Asia/Ho_Chi_Minh'
        // });
        // this.jobs.push({ name: 'daily-sync', job: dailyJob });

        this.isRunning = true;
        this.logger.info(`[HoK Scheduler] ✓ Started ${this.jobs.length} cron job(s)`);
        this.logger.info('[HoK Scheduler] Next run:', this.getNextRun());
    }

    /**
     * Stop all cron jobs
     */
    stop() {
        if (!this.isRunning) {
            this.logger.warn('[HoK Scheduler] Not running');
            return;
        }

        this.logger.info('[HoK Scheduler] Stopping all jobs...');
        this.jobs.forEach(({ name, job }) => {
            job.stop();
            this.logger.info(`[HoK Scheduler] Stopped: ${name}`);
        });

        this.jobs = [];
        this.isRunning = false;
        this.logger.info('[HoK Scheduler] ✓ All jobs stopped');
    }

    /**
     * Run sync manually (can be triggered via API endpoint)
     */
    async runSync() {
        if (this.isSyncing) {
            this.logger.warn('[HoK Scheduler] Sync already in progress, skipping...');
            return { success: false, message: 'Sync already in progress' };
        }

        this.isSyncing = true;
        const startTime = Date.now();

        try {
            this.logger.info('[HoK Scheduler] ========================================');
            this.logger.info('[HoK Scheduler] 🚀 Starting HoK meta sync process...');
            this.logger.info('[HoK Scheduler] ========================================');

            const result = await fetchAndSync({ logger: this.logger });

            this.lastRun = new Date();
            this.lastResult = result;

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            this.logger.info('[HoK Scheduler] ========================================');
            this.logger.info('[HoK Scheduler] ✅ Sync completed successfully!');
            this.logger.info(`[HoK Scheduler] - Heroes fetched: ${result.fetch.heroCount}`);
            this.logger.info(`[HoK Scheduler] - Heroes matched: ${result.sync.matched}`);
            this.logger.info(`[HoK Scheduler] - Heroes updated: ${result.sync.updated}`);
            this.logger.info(`[HoK Scheduler] - Duration: ${duration}s`);
            this.logger.info('[HoK Scheduler] ========================================');

            return {
                success: true,
                result,
                duration: `${duration}s`
            };

        } catch (error) {
            this.logger.error('[HoK Scheduler] ========================================');
            this.logger.error('[HoK Scheduler] ❌ Sync failed!');
            this.logger.error('[HoK Scheduler] Error:', error.message);
            this.logger.error('[HoK Scheduler] ========================================');

            this.lastRun = new Date();
            this.lastResult = {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };

            return {
                success: false,
                error: error.message
            };

        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Get next scheduled run time
     */
    getNextRun() {
        if (this.jobs.length === 0) return null;

        // Calculate next Friday 6 AM
        const now = new Date();
        const nextFriday = new Date(now);
        const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
        nextFriday.setDate(now.getDate() + daysUntilFriday);
        nextFriday.setHours(6, 0, 0, 0);

        return nextFriday.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isSyncing: this.isSyncing || false,
            activeJobs: this.jobs.length,
            lastRun: this.lastRun ? this.lastRun.toISOString() : null,
            lastResult: this.lastResult,
            nextRun: this.getNextRun()
        };
    }
}

// Singleton instance
let schedulerInstance = null;

/**
 * Get or create scheduler instance
 */
function getScheduler(logger) {
    if (!schedulerInstance) {
        schedulerInstance = new HoKMetaSyncScheduler(logger);
    }
    return schedulerInstance;
}

module.exports = {
    HoKMetaSyncScheduler,
    getScheduler
};
