const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const heroes = await Hero.find({}, 'name itemBuilds');
        const counts = {};
        const zeroBuilds = [];
        const oneBuild = [];
        const twoBuilds = [];
        const threeBuilds = [];

        heroes.forEach(h => {
            const c = h.itemBuilds ? h.itemBuilds.length : 0;
            counts[c] = (counts[c] || 0) + 1;
            if (c === 0) zeroBuilds.push(h.name);
            if (c === 1) oneBuild.push(h.name);
            if (c === 2) twoBuilds.push(h.name);
            if (c >= 3) threeBuilds.push(h.name);
        });

        console.log('Build Count Distribution:');
        Object.keys(counts).sort().forEach(k => {
            console.log(`${k} Builds: ${counts[k]} heroes`);
        });

        if (zeroBuilds.length > 0) {
            console.log('\nHeroes with 0 Builds:', zeroBuilds);
        }
        if (oneBuild.length > 0) {
            console.log('\nHeroes with 1 Build (Sample):', oneBuild.slice(0, 5));
        }
        if (twoBuilds.length > 0) {
            console.log('\nHeroes with 2 Builds (Sample):', twoBuilds.slice(0, 5));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
