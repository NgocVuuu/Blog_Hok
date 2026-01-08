const HeroDetailFetcher = require('../services/heroDetailFetcher');

// Mock logger
HeroDetailFetcher.prototype.logger = console;

(async () => {
    const fetcher = new HeroDetailFetcher();
    try {
        console.log('--- Testing Official Data ---');
        const official = await fetcher.fetchOfficialData(142); // Angela ID
        console.log('Official Result:', JSON.stringify(official, null, 2));

        console.log('\n--- Testing Wiki Data ---');
        const wiki = await fetcher.fetchWikiData('Angela');
        console.log('Wiki Result:', JSON.stringify(wiki, null, 2));

    } catch (e) {
        console.error(e);
    }
})();
