const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function checkHeroCounters() {
    if (!process.env.MONGODB_URI) throw new Error('No DB URI');
    await mongoose.connect(process.env.MONGODB_URI);

    const heroes = await Hero.find({ counters: { $not: { $size: 0 } } }).populate('counters.hero');
    console.log(`Found ${heroes.length} heroes with populated counters.`);

    if (heroes.length > 0) {
        const h = heroes[0];
        console.log(`\nExample: ${h.name}`);
        console.log(JSON.stringify(h.counters, null, 2));
    } else {
        console.log('No heroes have counters populated in Hero model.');
    }

    await mongoose.connection.close();
}

checkHeroCounters().catch(console.error);
