const { HeroDetailFetcher } = require('./services/heroDetailFetcher');
const logger = console;

async function run() {
    const fetcher = new HeroDetailFetcher(logger);
    // Hero ID 142 (Angela) or 109 (Xiao Qiao) or any common hero
    // Let's try 142
    const heroId = 142;
    console.log(`Fetching data for Hero ID: ${heroId}`);

    try {
        const data = await fetcher.fetchOfficialData(heroId, { blockResources: true });

        if (data && data.strategyData && data.strategyData.suitStrategy) {
            console.log('--- SUIT STRATEGY FOUND ---');
            const suits = data.strategyData.suitStrategy;
            suits.forEach((suit, index) => {
                console.log(`\nSUIT ${index + 1}:`);
                const s = suit.suitStrategy;
                if (s && s.runes) {
                    s.runes.forEach(r => {
                        console.log(`Rune: "${r.runeName}" (ID: ${r.runeId}, Color: ${r.runeColor}, Level: ${r.runeLevel})`);
                    });
                } else {
                    console.log('No runes found in suitStrategy.');
                }
            });
        } else {
            console.log('No strategyData found.');
            if (data && data.rawPresets) {
                console.log('Checking Raw Presets (Arcana):');
                if (data.rawPresets.arcana) {
                    console.log(JSON.stringify(data.rawPresets.arcana, null, 2));
                }
            }
        }

    } catch (e) {
        console.error(e);
    }
}

run();
