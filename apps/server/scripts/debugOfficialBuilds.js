const puppeteer = require('puppeteer');
const fs = require('fs');

const HERO_ID = process.argv[2] || 109; // Default Daji (Known Good)

(async () => {
    console.log(`[Debug] Fetching Official Data for Hero ID: ${HERO_ID}`);
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920x1080'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Intercept API
        const apiResponsePromise = page.waitForResponse(response =>
            response.url().includes('getherodataall') &&
            response.status() === 200 &&
            response.request().method() !== 'OPTIONS'
            , { timeout: 30000 }).catch(e => null);

        // Turn on logging
        // page.on('request', request => {
        //    console.log(`[Req] ${request.url()}`);
        // });

        // URL
        const targetUrl = `https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=${HERO_ID}#/hero-detail?heroId=${HERO_ID}`;
        console.log(`[Debug] Navigating to: ${targetUrl}`);

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        const response = await apiResponsePromise;
        if (response) {
            console.log(`[Debug] API Intercepted! URL: ${response.url()}`);
            const json = await response.json();

            if (json.data) {
                console.log('Saving strategy_clean.json...');
                fs.writeFileSync('strategy_clean.json', JSON.stringify(json.data, null, 2));
            } else {
                console.log('[Error] JSON has no data property');
                console.log(JSON.stringify(json, null, 2));
            }

        } else {
            console.log('[Error] API Response Timeout or Not Found');
        }

    } catch (error) {
        console.error(`[Error] ${error.message}`);
    } finally {
        await browser.close();
    }
})();
