const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Fetch all heroes
        const heroes = await Hero.find({}, 'name metaTier winRate pickRate banRate').lean();

        // Map to the format needed by syncHoKMetaService/hokStaticProvider
        // The "unmatched" logic expects { sourceName, stats: { ... } }
        // But hokStaticProvider normalizes the JSON.
        // We just need a simple list that looks like the ranklist.

        const healList = heroes.map(h => ({
            heroName: h.name,
            // Include stats so they don't get wiped or set to defaults if logic relies on them
            metaTier: h.metaTier,
            winRate: h.winRate,
            pickRate: h.pickRate,
            banRate: h.banRate,
            // Flag for our reference, though unused by sync logic directly
            _forceUpdate: true
        }));

        console.log(`Found ${heroes.length} heroes. Writing to heroes_to_heal.json`);
        const targetPath = path.join(__dirname, '..', 'heroes_to_heal.json');
        fs.writeFileSync(targetPath, JSON.stringify(healList, null, 2));
        console.log('Done.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
