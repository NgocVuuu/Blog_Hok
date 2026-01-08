const HeroDetailFetcher = require('../services/heroDetailFetcher');

(async () => {
    const fetcher = new HeroDetailFetcher();

    // Test Official Site (Angela - ID usually 156 or similar, user said 199 in URL example but param said 172. Let's try to match user's URL heroId=199)
    // User URL: index.html?...heroId=199#/hero-hot-list
    // User URL 2: hero-detail?heroId=172
    // Let's try 199 first as per user prompt, or we can fetch a list first if we were integrating.
    // For test, let's try a known ID. 
    // In HoK, IDs are usually 3 digits. 
    // Let's try 199 as requested.

    console.log('--- Testing Official Site Fetch (ID: 199) ---');
    try {
        const officialData = await fetcher.fetchOfficialData(199);
        console.log('Official Data Result:', JSON.stringify(officialData, null, 2));
    } catch (e) {
        console.error('Official Fetch Error:', e);
    }

    // Test Wiki (Angela)
    console.log('\n--- Testing Wiki Fetch (Name: Angela) ---');
    try {
        const wikiData = await fetcher.fetchWikiData('Angela');
        console.log('Wiki Data Result:', JSON.stringify(wikiData, null, 2));
    } catch (e) {
        console.error('Wiki Fetch Error:', e);
    }

    process.exit(0);
})();
