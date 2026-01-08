const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const hero = await Hero.findOne({ name: 'Daji' }).lean();
        if (!hero) {
            console.log('Angela not found');
        } else {
            console.log('--- INSPECTION REPORT: Angela ---');
            console.log(`ID: ${hero._id}`);
            console.log(`Image (Avatar): ${hero.image}`);
            console.log(`Banner Image: ${hero.bannerImage}`);
            console.log(`Win Rate: ${hero.winRate}%`);
            console.log(`Ban Rate: ${hero.banRate}%`);
            console.log(`Pick Rate: ${hero.pickRate}%`);
            console.log(`Meta Tier: ${hero.metaTier}`);
            console.log(`Lanes: ${JSON.stringify(hero.lanes)}`);
            console.log(`Roles: ${JSON.stringify(hero.roles)}`);
            console.log(`Item Builds: ${hero.itemBuilds ? hero.itemBuilds.length : 0}`);
            console.log(`Arcana Builds: ${hero.arcanaBuilds ? hero.arcanaBuilds.length : 0}`);
            console.log('---------------------------------');

            if (hero.winRate > 100) console.warn('WARNING: Win Rate seems abnormally high (normalization issue?)');
            if (hero.banRate > 100) console.warn('WARNING: Ban Rate seems abnormally high');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
