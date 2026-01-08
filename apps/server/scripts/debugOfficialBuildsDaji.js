const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
    // ID for Daji is 109
    const heroId = '109';
    const url = `https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=${heroId}#/hero-detail?heroId=${heroId}`;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Logging
    page.on('response', res => {
        if (res.url().includes('getherodataall')) {
            console.log(`[Response] API Intercepted: ${res.url()} (${res.status()})`);
        }
    });

    try {
        const goal = page.waitForResponse(response =>
            response.url().includes('getherodataall') && response.status() === 200
            , { timeout: 30000 });

        // Navigate
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting for API promise...');
        const response = await goal;

        if (!response) {
            console.log('Response object is null/undefined');
        } else {
            console.log('Reading response text...');
            const text = await response.text(); // This crashes if response body unavailable
            console.log(`Response length: ${text.length}`);
            const json = JSON.parse(text);

            fs.writeFileSync('daji_strategy.json', JSON.stringify(json, null, 2), 'utf-8');
            console.log('Saved to daji_strategy.json');

            if (json.data && json.data.strategyData && json.data.strategyData.suitStrategy) {
                console.log(`Found ${json.data.strategyData.suitStrategy.length} suits.`);
            } else {
                console.log('NO suitStrategy found (or invalid path). Keys:' + (json.data ? Object.keys(json.data) : 'data is null'));
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await browser.close();
    }
})();
