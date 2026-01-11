const puppeteer = require('puppeteer');

async function debugFetch() {
    console.log('Launching browser to check POSITIONS...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let captured = false;

    await page.setRequestInterception(true);
    page.on('request', req => {
        if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    page.on('response', async res => {
        if (res.url().includes('getranklist') && !captured) {
            try {
                const json = await res.json();
                if (json.data && json.data.list && json.data.list.length > 0) {
                    const sTierHeroes = json.data.list.filter(h => h.tRank === 0 || h.tRank === '0');
                    console.log('--- HEROES WITH tRANK 0 ---');
                    sTierHeroes.forEach(h => console.log(h.heroName || h.heroInfo?.heroName));
                    console.log('---------------------------');

                    captured = true;
                    process.exit(0);
                }
            } catch (e) { }
        }
    });

    try {
        await page.goto('https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=199#/hero-hot-list', { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) {
        if (!captured) console.error('Time out, no API captured');
    }

    setTimeout(async () => {
        if (!captured) await browser.close();
    }, 10000);
}

debugFetch();
