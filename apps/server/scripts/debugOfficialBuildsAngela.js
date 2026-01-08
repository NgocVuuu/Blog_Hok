const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
    // ID for Angela is 142
    const heroId = '142';
    const url = `https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=${heroId}#/hero-detail?heroId=${heroId}`;

    console.log(`Navigating to: ${url}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let capturedData = null;

    // Log all responses to identify the correct API call
    page.on('response', res => {
        const url = res.url();
        if (url.includes('api')) {
            console.log(`[Response] ${url} (${res.status()})`);
        }
    });

    try {
        console.log('Waiting for API...');
        const goal = page.waitForResponse(response =>
            response.url().includes('getherodataall') && response.status() === 200
            , { timeout: 45000 });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Changed to domcontentloaded for speed

        const response = await goal;
        console.log('Intercepted response!');
        const text = await response.text();
        capturedData = JSON.parse(text);

    } catch (e) {
        console.error('Error during interception:', e.message);
    }

    if (capturedData && capturedData.data) {
        fs.writeFileSync('angela_strategy.json', JSON.stringify(capturedData, null, 2), 'utf-8');
        console.log('Saved to angela_strategy.json');

        const s = capturedData.data.strategyData;
        if (s && s.suitStrategy) {
            console.log('Found suitStrategy. Length:', s.suitStrategy.length);
        } else {
            console.log('NO suitStrategy found. Keys:', s ? Object.keys(s) : 'strategyData is null');
        }
    } else {
        console.log('Failed to capture valid data.');
    }
})();
