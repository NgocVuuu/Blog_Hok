const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const heroId = 519;
    const url = `https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=${heroId}#/hero-detail?heroId=${heroId}`;

    console.log(`Navigating to ${url}...`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920x1080']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Setup interception
    page.on('response', async (response) => {
        const u = response.url();
        if (u.includes('getherodataall')) {
            console.log(`Intercepted: ${u}`);
            try {
                const json = await response.json();
                const len = JSON.stringify(json).length;
                console.log('JSON Length:', len);
                fs.appendFileSync('debug_responses_log.txt', `URL: ${u}\nLength: ${len}\nHasStrategy: ${!!(json.data && json.data.strategyData && json.data.strategyData.suitStrategy)}\n\n`);
                if (json.data && json.data.strategyData && json.data.strategyData.suitStrategy && json.data.strategyData.suitStrategy.length > 0) {
                    fs.writeFileSync('debug_aoyin_correct.json', JSON.stringify(json, null, 2));
                    console.log('FOUND CORRECT DATA! Saved to debug_aoyin_correct.json');
                }
            } catch (e) {
                console.error('Failed to parse JSON:', e);
            }
        }
    });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait a bit more to ensure everything loads
    await new Promise(r => setTimeout(r, 10000));

    await browser.close();
})();
