const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Helper sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Automatically fetch hero stats from Honor of Kings official website
 * using Puppeteer to intercept the API call
 * 
 * @param {Object} options
 * @param {boolean} options.headless - Run browser in headless mode (default: true)
 * @param {number} options.timeout - Max wait time in ms (default: 30000)
 * @param {boolean} options.saveToFile - Save JSON to file (default: true)
 * @param {string} options.outputPath - Custom output path (default: hok-ranklist.sample.json)
 * @returns {Promise<Object>} The fetched hero stats data
 */
async function fetchHeroStats(options = {}) {
    const {
        headless = true,
        timeout = 30000,
        saveToFile = true,
        outputPath = path.join(__dirname, '..', 'hok-ranklist.sample.json')
    } = options;

    const logger = options.logger || console;
    let browser = null;

    try {
        logger.info('[HoK Auto Fetcher] Starting browser...');

        // Launch browser
        browser = await puppeteer.launch({
            headless: headless ? 'new' : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });

        const page = await browser.newPage();

        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Variable to store the intercepted response
        let heroStatsData = null;

        // Enable request interception to block heavy resources
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            const resourceType = req.resourceType();
            // Block ONLY visual/heavy resources. 
            // CRITICAL: Do NOT block 'script', 'xhr', 'fetch', or 'other' (which can be APIs)
            if (['image', 'media', 'font', 'stylesheet', 'texttrack', 'imageset', 'bacon', 'csp_report'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Intercept API responses
        page.on('response', async (response) => {
            const url = response.url();

            // Check if this is the getranklist API
            if (url.includes('getranklist')) {
                try {
                    logger.info('[HoK Auto Fetcher] Intercepted getranklist API call!');
                    const json = await response.json();
                    heroStatsData = json;
                    logger.info(`[HoK Auto Fetcher] Successfully captured data with ${json?.data?.list?.length || 0} heroes`);
                } catch (err) {
                    logger.warn('[HoK Auto Fetcher] Failed to parse API response:', err.message);
                }
            }
        });

        logger.info('[HoK Auto Fetcher] Navigating to HoK website...');

        // Navigate to the hero ranking page
        await page.goto('https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=199#/hero-hot-list', {
            waitUntil: 'networkidle2',
            timeout
        });

        // Wait for API call to complete
        logger.info('[HoK Auto Fetcher] Waiting for API response...');
        await sleep(3000);

        // Additional wait to ensure API call is captured
        let attempts = 0;
        while (!heroStatsData && attempts < 10) {
            await sleep(1000);
            attempts++;
            if (attempts % 3 === 0) {
                logger.info(`[HoK Auto Fetcher] Still waiting for API response... (${attempts}s)`);
            }
        }

        if (!heroStatsData) {
            throw new Error('Failed to intercept API response after multiple attempts');
        }

        // Validate data structure
        if (!heroStatsData.data || !heroStatsData.data.list) {
            throw new Error('Invalid data structure received from API');
        }

        logger.info('[HoK Auto Fetcher] Data validation passed!');

        // Save to file if requested
        if (saveToFile) {
            const jsonString = JSON.stringify(heroStatsData, null, 2);
            await fs.writeFile(outputPath, jsonString, 'utf8');
            logger.info(`[HoK Auto Fetcher] Data saved to: ${outputPath}`);
            logger.info(`[HoK Auto Fetcher] File size: ${(jsonString.length / 1024).toFixed(2)} KB`);
        }

        return {
            success: true,
            data: heroStatsData,
            stats: {
                heroCount: heroStatsData.data.list.length,
                updateTime: heroStatsData.data.updateTime,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        logger.error('[HoK Auto Fetcher] Error:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            logger.info('[HoK Auto Fetcher] Browser closed');
        }
    }
}

/**
 * Fetch and sync hero stats in one go
 * This combines fetching data and running the sync script
 * 
 * @param {Object} options
 * @returns {Promise<Object>} Combined fetch and sync results
 */
async function fetchAndSync(options = {}) {
    const logger = options.logger || console;

    try {
        // Step 1: Fetch data
        logger.info('[HoK Auto Sync] Step 1/2: Fetching latest hero stats...');
        const fetchResult = await fetchHeroStats(options);

        if (!fetchResult.success) {
            throw new Error('Failed to fetch hero stats');
        }

        // Step 2: Run sync
        logger.info('[HoK Auto Sync] Step 2/2: Syncing to database...');
        const { syncHoKMeta } = require('./syncHoKMetaService');
        // Pass scopes and healForce options
        const syncResult = await syncHoKMeta({
            logger,
            scopes: options.scopes,
            healForce: options.healForce
        });

        return {
            success: true,
            fetch: fetchResult.stats,
            sync: syncResult,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        logger.error('[HoK Auto Sync] Error:', error.message);
        throw error;
    }
}

module.exports = {
    fetchHeroStats,
    fetchAndSync
};
