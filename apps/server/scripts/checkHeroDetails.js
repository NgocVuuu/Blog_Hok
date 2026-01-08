const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
// Assume running from root, so path to .env is apps/server/.env
require('dotenv').config({ path: path.join(process.cwd(), 'apps', 'server', '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloghok';

async function checkHero() {
    await mongoose.connect(MONGO_URI);
    console.log('DB Connected');

    const hero = await Hero.findOne({ slug: 'chicha' });
    if (!hero) {
        console.log('Hero Chicha not found');
    } else {
        console.log('--- Chicha Data ---');
        console.log(`Lanes: ${JSON.stringify(hero.lanes)}`);
        console.log(`Roles: ${JSON.stringify(hero.roles)}`);
        console.log(`Skins Count: ${hero.skins.length}`);
        console.log(`Skills Count: ${hero.skills.length}`);
        console.log(`Skill Builds: ${hero.skillBuilds ? hero.skillBuilds.length : 0}`);

        if (hero.skillBuilds && hero.skillBuilds.length > 0) {
            hero.skillBuilds.forEach(b => {
                console.log(`  - Build: ${b.name} (${b.skills.length} skills)`);
                b.skills.forEach(s => console.log(`    * ${s.name}: ${s.description.substring(0, 50)}...`));
            });
        }
    }

    // Also check general stats
    const total = await Hero.countDocuments();
    const unknownLanes = await Hero.countDocuments({ lanes: 'Unknown' });
    const knownLanes = await Hero.countDocuments({ lanes: { $ne: 'Unknown' } });

    console.log('\n--- Overall Progress ---');
    console.log(`Total Heroes: ${total}`);
    console.log(`Heroes with Unknown Lanes: ${unknownLanes}`);
    console.log(`Heroes with Valid Lanes: ${knownLanes}`);

    await mongoose.disconnect();
}

checkHero();
