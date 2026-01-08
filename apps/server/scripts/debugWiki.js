const { HeroDetailFetcher } = require('../services/heroDetailFetcher');
const fs = require('fs');

(async () => {
    const logger = {
        info: (msg) => console.log('[INFO]', msg),
        warn: (msg) => console.warn('[WARN]', msg),
        error: (msg) => console.error('[ERROR]', msg),
    };

    const fetcher = new HeroDetailFetcher(logger);

    // Lady Zhen
    const name = 'Lady Zhen';
    console.log(`fetching wiki for ${name}...`);

    try {
        const data = await fetcher.fetchWikiData(name);
        console.log('Result:', JSON.stringify(data, null, 2));
        if (data.lore) {
            console.log('SUCCESS: Lore found!');
        } else {
            console.log('FAILURE: No Lore extracted.');
        }
    } catch (e) {
        console.error(e);
    }
})();
