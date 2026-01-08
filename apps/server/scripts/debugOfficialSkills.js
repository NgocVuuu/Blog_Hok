const { HeroDetailFetcher } = require('../services/heroDetailFetcher');
const path = require('path');
const fs = require('fs');

(async () => {
    const fetcher = new HeroDetailFetcher(console);
    const heroId = 109; // Daji
    console.log(`fetching official data for Daji (${heroId})...`);

    // Launch browser separately if needed or let fetcher handle it
    const data = await fetcher.fetchOfficialData(heroId);

    console.log('--- Official Data Result ---');
    if (data) {
        console.log(`Title: ${data.title}`);
        console.log(`Skills Found: ${data.skills ? data.skills.length : 0}`);
        if (data.skills) {
            data.skills.forEach((s, i) => {
                console.log(`[${i}] ${s.name}`);
                console.log(`    Icon: ${s.icon}`);
                console.log(`    Desc: ${s.description ? s.description.substring(0, 30) + '...' : ''}`);
            });
        }
        console.log(`Raw Equip Presets: ${data.rawPresets?.equip ? data.rawPresets.equip.length : 0}`);
    } else {
        console.log('Fetch returned null.');
    }
})();
