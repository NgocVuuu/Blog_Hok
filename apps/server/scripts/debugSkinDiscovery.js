const axios = require('axios');
const fs = require('fs');

async function checkUrl(url) {
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (e) {
        return false;
    }
}

(async () => {
    // Daji ID: 109
    const heroId = 109;
    const heroName = 'Daji';
    console.log(`Checking skins for ${heroName} (${heroId})...`);

    const foundSkins = [];

    // Check indices 1 to 15
    for (let i = 1; i <= 15; i++) {
        // Pattern: https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/{heroId}/{heroId}-bigskin-{index}.jpg
        const url = `https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/${heroId}/${heroId}-bigskin-${i}.jpg`;

        process.stdout.write(`Checking index ${i}: `);
        const exists = await checkUrl(url);

        if (exists) {
            console.log('FOUND');
            foundSkins.push(url);
        } else {
            console.log('Missing');
            // Consecutive misses might mean end, but sometimes there are gaps? 
            // usually skins are sequential.
            if (i > 10 && !exists) break;
        }
    }

    console.log('\n--- Results ---');
    console.log(`Found ${foundSkins.length} skins.`);
    foundSkins.forEach((u, idx) => console.log(`${idx + 1}: ${u}`));

})();
