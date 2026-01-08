const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=142#/hero-detail?heroId=142';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(r => setTimeout(r, 10000)); // Wait for render

        const html = await page.content();
        fs.writeFileSync('dump_angela_full.html', html);
        console.log('Dumped HTML to dump_angela_full.html');

    } catch (e) {
        console.error(e);
    }

    await browser.close();
})();
