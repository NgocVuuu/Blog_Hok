const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const allHeroes = await Hero.find({});
        console.log(`Checking ${allHeroes.length} heroes for Skin Names...`);

        let genericCount = 0;
        let totalSkins = 0;
        const badHeroes = [];

        // Specific checks
        const checkList = ['Han Xin', 'Alessio', 'Li Xin', 'Gao', 'Shi'];

        for (const h of allHeroes) {
            if (!h.skins || h.skins.length === 0) continue;

            let hasGeneric = false;
            h.skins.forEach(s => {
                totalSkins++;
                if (s.name && s.name.match(/^Skin \d+$/)) {
                    genericCount++;
                    hasGeneric = true;
                }
            });

            if (checkList.some(n => h.name.includes(n))) {
                console.log(`[Target Check] ${h.name}: ${h.skins.map(s => s.name).join(', ')}`);
            }

            if (hasGeneric) {
                if (badHeroes.length < 5) badHeroes.push(h.name);
            }
        }

        console.log(`\n--- Report ---`);
        console.log(`Total Skins: ${totalSkins}`);
        console.log(`Generic Names (Skin X): ${genericCount}`);
        console.log(`Generic Rate: ${((genericCount / totalSkins) * 100).toFixed(1)}%`);
        if (badHeroes.length > 0) {
            console.log(`Sample Heroes with generic names: ${badHeroes.join(', ')}...`);
        } else {
            console.log('No heroes with generic skin names found!');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
