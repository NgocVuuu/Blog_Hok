const cron = require('node-cron');
const { fetchAndSync } = require('./hokAutoFetcher');
const { OfficialNewsScraper } = require('./OfficialNewsScraper');

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

        // MIGRATION: Moved to GitHub Actions to save VPS resources
        // This ensures the heavy crawler runs on GitHub infrastructure, not on our 1 vCPU server.
        // See: .github/workflows/weekly-sync.yml
        /*
        const mainJob = cron.schedule('0 6 * * 5', async () => {
            this.logger.info('[HoK Scheduler] ⏰ Weekly Sync triggered (Stats + Builds)!');
            try {
                await this.runSync();
            } catch (error) {
                this.logger.error('[HoK Scheduler] Sync failed:', error);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Ho_Chi_Minh'
        });
        this.jobs.push({ name: 'weekly-sync', job: mainJob });
        */
        this.logger.info('[HoK Scheduler] Internal Weekly Sync disabled (Moved to GitHub Actions)');

        // MIGRATION: Moved to GitHub Actions (.github/workflows/daily-news.yml)
        /*
        // Official News Scraper - Daily at 7:00 AM
        const newsJob = cron.schedule('0 7 * * *', async () => {
            this.logger.info('[HoK Scheduler] ⏰ Daily News Scrape triggered!');
            await this.runNewsScrape();
        }, {
            scheduled: true,
            timezone: 'Asia/Ho_Chi_Minh'
        });
        this.jobs.push({ name: 'news-scraper', job: newsJob });
        */
        this.logger.info('[HoK Scheduler] Internal Daily News Scraper disabled (Moved to GitHub Actions)');


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

            // --- STEP 1: Stats & Build Sync (Weekly) ---
            const result = await fetchAndSync({
                logger: this.logger,
                scopes: ['stats', 'builds'],
                healForce: true
            });

            // --- STEP 2: Bi-Weekly Discovery (Heroes & Skins) ---
            // Check if this is a "Discovery Week" (odd weeks based on ISO week number or simple toggle?)
            // Simple approach: Check if current week number is ODD (or even). 
            // We use ISO week number to be consistent.
            const currentWeek = this.getWeekNumber(new Date());
            const isDiscoveryWeek = currentWeek % 2 !== 0; // Run on odd weeks (e.g., W1, W3, W5...)

            let discoveryResult = null;

            if (isDiscoveryWeek) {
                this.logger.info(`[HoK Scheduler] 🕵️ Discovery Week (W${currentWeek}) - Starting Discovery Service...`);

                const { HoKDiscoveryService } = require('./hokDiscoveryService');
                const discoveryService = new HoKDiscoveryService(this.logger);

                // 2A. Discover Heroes
                const heroDiscovery = await discoveryService.scanForNewHeroes();
                this.logger.info(`[HoK Scheduler] - Hero Discovery: ${JSON.stringify(heroDiscovery)}`);

                // 2B. Discover Skins (Optional: could be heavy, maybe run fewer heroes or separate if timeout issues)
                const skinDiscovery = await discoveryService.scanForNewSkins();
                this.logger.info(`[HoK Scheduler] - Skin Discovery: ${JSON.stringify(skinDiscovery)}`);

                discoveryResult = { heroes: heroDiscovery, skins: skinDiscovery };
            } else {
                this.logger.info(`[HoK Scheduler] ⏭️ Skipping Discovery (Week W${currentWeek} is Even). Next run: W${currentWeek + 1}`);
            }

            // --- STEP 3: Automated Draft Generation (Weekly) ---
            this.logger.info('[HoK Scheduler] ✍️ Generating Weekly Drafts...');
            const { DraftGeneratorService } = require('./draftGeneratorService');
            const draftService = new DraftGeneratorService(this.logger);
            const draftResult = await draftService.generateWeeklyDrafts();
            this.logger.info(`[HoK Scheduler] Drafts Result: ${JSON.stringify(draftResult)}`);


            this.lastRun = new Date();
            this.lastResult = { ...result, discoveryResult, draftResult };

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            this.logger.info('[HoK Scheduler] ========================================');
            this.logger.info('[HoK Scheduler] ✅ All Jobs Completed!');
            this.logger.info(`[HoK Scheduler] - Stats updated: ${result.sync.updated}`);
            if (discoveryResult) {
                this.logger.info(`[HoK Scheduler] - Discovery: ${discoveryResult.heroes.draftsCreated} Heroes, ${discoveryResult.skins.draftsCreated} Skins`);
            }
            if (draftResult) {
                this.logger.info(`[HoK Scheduler] - Articles Drafted: ${draftResult.draftsCreated}`);
            }
            this.logger.info(`[HoK Scheduler] - Duration: ${duration}s`);
            this.logger.info('[HoK Scheduler] ========================================');

            return {
                success: true,
                result: this.lastResult,
                duration: `${duration}s`
            };

        } catch (error) {
            this.logger.error('[HoK Scheduler] ========================================');
            this.logger.error('[HoK Scheduler] ❌ Job Failed!');
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

    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
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
    /**
     * Run the official news scraper manually or via cron
     */
    async runNewsScrape() {
        this.logger.info('[HoK Scheduler] 📰 Starting Official News Scraper...');
        try {
            const scraper = new OfficialNewsScraper(this.logger);
            const count = await scraper.scrapeOfficialNews();
            this.logger.info(`[HoK Scheduler] 📰 Scrape complete. Created ${count} drafts.`);
            return { success: true, created: count };
        } catch (error) {
            this.logger.error('[HoK Scheduler] 📰 Scrape failed:', error);
            return { success: false, error: error.message };
        }
    }

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
