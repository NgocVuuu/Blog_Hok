const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'debug_last_strategy.json');
try {
    const raw = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(raw);

    // Check structure
    let strategyData = json;
    if (json.data && json.data.strategyData) strategyData = json.data.strategyData;
    else if (json.strategyData) strategyData = json.strategyData; // Found it at root
    else if (json.data) strategyData = json.data; // fallback

    // It might be nested in 'data' without 'strategyData' key if I saved json.data directly
    // debugOfficialBuilds.js saved `json.data` to strategy_clean.json

    if (strategyData.suitStrategy) {
        console.log(`Suits found: ${strategyData.suitStrategy.length}`);
        if (strategyData.suitStrategy.length > 0) {
            console.log('Suit 1 Keys:', Object.keys(strategyData.suitStrategy[0]));
            console.log('Suit 1 Sample:', JSON.stringify(strategyData.suitStrategy[0], null, 2));
        }
        strategyData.suitStrategy.forEach((suit, i) => {
            console.log(`Suit ${i + 1}:`);
            console.log(`  Equips: ${suit.equips ? suit.equips.length : 0}`);
            if (suit.equips) {
                suit.equips.forEach(e => console.log(`    - ${e.equipName} (ID: ${e.equipId})`));
            }
            console.log(`  Runes (Definitions): ${suit.runes ? suit.runes.length : 0}`);
            console.log(`  Rune IDs (Count): ${suit.runeIds ? suit.runeIds.length : 0}`);
            if (suit.runeIds) {
                console.log(`    IDs: ${JSON.stringify(suit.runeIds)}`);
            }
        });
    } else {
        console.log('No suitStrategy found in file.');
        console.log('Keys:', Object.keys(strategyData));
    }

} catch (e) {
    console.error(e);
}
