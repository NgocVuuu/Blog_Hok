const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const heroId = '109';
    const url = `https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=${heroId}#/hero-detail?heroId=${heroId}`;

    // Match HeroDetailFetcher settings exactly
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920x1080'
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        const apiResponsePromise = page.waitForResponse(response =>
            response.url().includes('getherodataall') &&
            response.status() === 200 &&
            response.request().method() !== 'OPTIONS'
            , { timeout: 30000 }).catch(e => null);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const response = await apiResponsePromise;
        if (response) {
            const json = await response.json();
            const strategyData = json.data?.strategyData;

            if (strategyData && strategyData.suitStrategy) {
                console.log(`Suits found: ${strategyData.suitStrategy.length}`);

                strategyData.suitStrategy.slice(0, 3).forEach((wrapper, i) => {
                    const suit = wrapper.suitStrategy;
                    console.log(`\nSuit ${i + 1} (${wrapper.nickname || 'Official'}) Inner Keys: ${suit ? Object.keys(suit).length : 'Undefined'}`);

                    if (suit && suit.equips) {
                        console.log(`  Equips Length: ${suit.equips.length}`);
                        suit.equips.forEach(e => console.log(`    - Name: "${e.equipName}", ID: ${e.equipId}, Icon: ${e.equipIcon ? 'Yes' : 'No'}`));
                    } else {
                        console.log('  NO inner equips property.');
                    }

                    if (suit && suit.equipIds) {
                        // equipIds might be array of objects or strings in some versions?
                        console.log(`  Inner Equip IDs: ${JSON.stringify(suit.equipIds)}`);
                    }

                    if (suit && suit.runes) {
                        console.log(`  Runes Length: ${suit.runes.length}`);
                    }
                    if (suit && suit.runeIds) {
                        console.log(`  Rune IDs Length: ${suit.runeIds.length}`);
                    }
                });
            } else {
                console.log('No strategyData found.');
            }
        } else {
            console.log('API timeout or null response.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
