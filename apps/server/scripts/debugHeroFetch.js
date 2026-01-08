const { HeroDetailFetcher } = require('../services/heroDetailFetcher');

(async () => {
    const fetcher = new HeroDetailFetcher(console);

    const testHeroes = [
        { id: 538, name: "Gao Changgong" }, // 0 Builds
        { id: 517, name: "Augran" },        // 0 Builds
    ];

    for (const h of testHeroes) {
        console.log(`\n\n=== Fetching Data for ${h.name} (ID: ${h.id}) ===`);
        const data = await fetcher.fetchOfficialData(h.id);

        if (!data) {
            console.log('FAILED to fetch data.');
            continue;
        }

        console.log(`[${h.name}] Strategy Data Present?`, !!data.strategyData);
        if (data.strategyData) {
            const suit = data.strategyData.suitStrategy || [];
            console.log(`[${h.name}] Strategy Suits Count:`, suit.length);
            suit.forEach((s, i) => {
                if (i < 3) {
                    const eqCount = s.suitStrategy && s.suitStrategy.equips ? s.suitStrategy.equips.length : 0;
                    const rCount = s.suitStrategy && s.suitStrategy.runes ? s.suitStrategy.runes.length : 0;
                    console.log(`  Suit ${i + 1}: Valid? ${!!s.suitStrategy}, Equips: ${eqCount}, Runes: ${rCount}`);

                    if (s.suitStrategy) {
                        // Dump logic if needed
                    }
                }
            });
        } else {
            console.log(`[${h.name}] Strategy Data is NULL or Missing`);
        }

        console.log(`[${h.name}] Raw Presets Present?`, !!data.rawPresets);
        if (data.rawPresets) {
            const equip = data.rawPresets.equip || [];
            console.log(`[${h.name}] Raw Equip Presets Count:`, equip.length);
            equip.forEach((e, i) => {
                console.log(`  Preset ${i + 1} Items:`, Array.isArray(e) ? e.length : 'N/A');
            });
        }
    }

})();
