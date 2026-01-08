const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Use mobile user agent as it seems to be an H5 app
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36');

    // Angela ID 142
    const url = 'https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=142#/hero-detail?heroId=142';
    console.log(`Navigating to ${url}...`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the stats to render by looking for text
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Win Rate');
        }, { timeout: 20000 });
        console.log('Found "Win Rate" text!');
    } catch (e) {
        console.log('Could not find "Win Rate" text, dumping anyway... (Might be loading)');
    }

    // Take screenshot
    await page.screenshot({ path: 'debug_stats_page.png', fullPage: true });
    console.log('Screenshot saved to debug_stats_page.png');

    const html = await page.content();
    fs.writeFileSync('dump_angela_stats.html', html);
    console.log('Dumped to dump_angela_stats.html');

    // Attempt to identify stats container classes
    const statsAnalysis = await page.evaluate(() => {
        const result = [];
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
            if (div.innerText.includes('Win Rate')) {
                result.push({
                    className: div.className,
                    text: div.innerText.substring(0, 100) // First 100 chars
                });
            }
        });
        return result;
    });
    console.log('Potential stat containers:', statsAnalysis);

    await browser.close();
})();
