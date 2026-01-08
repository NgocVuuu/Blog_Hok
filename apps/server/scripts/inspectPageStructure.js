const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = 'https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=142#/hero-detail?heroId=142';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait for hydration
    await new Promise(r => setTimeout(r, 10000));

    // Scrape all images
    const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            class: img.className,
            id: img.id,
            parentClass: img.parentElement ? img.parentElement.className : '',
            width: img.width,
            height: img.height
        }));
    });

    console.log('--- Images Found ---');
    images.forEach(img => {
        // Filter out small icons/pixels
        if (img.width > 50 && img.height > 50) {
            console.log(JSON.stringify(img));
        }
    });

    await browser.close();
})();
