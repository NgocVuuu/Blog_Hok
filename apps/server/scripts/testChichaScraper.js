const { HeroDetailFetcher } = require('../services/heroDetailFetcher');

(async () => {
    const fetcher = new HeroDetailFetcher();
    const rawName = 'Chicha'; // Nickname

    console.log(`Testing scraper for: ${rawName}`);

    // Check mapping
    const resolved = fetcher.resolveHeroName(rawName);
    console.log(`Resolved Name: ${resolved}`);

    if (resolved === rawName) {
        console.warn('WARNING: Name not resolved!');
    }

    // Try dummy fetch (Wiki)
    const wikiData = await fetcher.fetchWikiData(rawName);
    console.log('Wiki Data:', wikiData ? 'FOUND' : 'NULL');
    if (wikiData) {
        console.log('Lore Preview:', wikiData.lore ? wikiData.lore.substring(0, 50) + '...' : 'MISSING');
        console.log('Skins Names:', wikiData.skins.map(s => s.name).join(', '));
    }

    // Try dummy fetch (Liquipedia)
    const liqData = await fetcher.fetchLiquipediaData(rawName);
    console.log('Liquipedia Data:', liqData ? 'FOUND' : 'NULL');
    if (liqData) {
        console.log('Liquipedia Title:', liqData.title);
        console.log('Liquipedia Skins:', liqData.skins);
    }

})();
