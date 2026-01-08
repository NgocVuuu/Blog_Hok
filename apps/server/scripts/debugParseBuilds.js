const fs = require('fs');

const data = JSON.parse(fs.readFileSync('strategy_clean.json', 'utf-8'));

function parseBuilds(jsonData) {
    if (!jsonData || !jsonData.strategyData || !jsonData.strategyData.suitStrategy) {
        console.log('No strategy data found');
        return;
    }

    const wrappers = jsonData.strategyData.suitStrategy;
    console.log(`Found ${wrappers.length} build wrappers.`);

    const builds = [];
    wrappers.forEach((wrapper, index) => {
        const suit = wrapper.suitStrategy;
        if (!suit) {
            console.log(`Wrapper ${index} has no suitStrategy`);
            return;
        }

        const equipBuild = {
            name: `Build ${index + 1} (${wrapper.roleJobName || 'Official'})`,
            items: suit.equips ? suit.equips.map(e => ({
                id: e.equipId,
                name: e.equipName,
                icon: e.equipIcon
            })) : []
        };

        const arcanaBuild = {
            name: `Arcana ${index + 1} (${suit.desc || 'Official'})`,
            items: suit.runes ? suit.runes.map(r => ({
                id: r.runeId,
                name: r.runeName,
                icon: r.runeIcon,
                desc: r.runeDesc
            })) : []
        };

        builds.push({ equipBuild, arcanaBuild });
    });

    return builds;
}

const parsed = parseBuilds(data);
console.log(JSON.stringify(parsed, null, 2));
