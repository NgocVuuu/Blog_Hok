const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const HeroRaw = require('../models/HeroRaw');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function debugRaw() {
    if (!process.env.MONGODB_URI) throw new Error('No DB URI');
    await mongoose.connect(process.env.MONGODB_URI);

    // Get an Assassin
    const lam = await Hero.findOne({ name: 'Lam' });
    if (!lam) {
        console.log('Hero Lam not found in Hero collection.');
    } else {
        console.log(`Hero Lam ID: ${lam._id}`);
        // Try to find Raw
        const raw = await HeroRaw.findOne({ hero: lam._id });
        if (!raw) {
            console.log('HeroRaw not found for Lam.');

            // Try matching by name just in case
            const rawByName = await HeroRaw.findOne({ cname: 'Lam' }); // cname is usually the name in raw
            if (rawByName) console.log('Found Raw by name!');
        } else {
            console.log('HeroRaw Found.');
            console.log('Strategy Data keys:', raw.strategyData ? Object.keys(raw.strategyData) : 'None');
        }
    }

    // Check one that might have data?
    const anyRaw = await HeroRaw.findOne({ 'strategyData.minus': { $exists: true } });
    if (anyRaw) {
        console.log(`\nExample with Strategy Data: ${anyRaw.cname}`);
        console.log(JSON.stringify(anyRaw.strategyData.minus?.[0], null, 2));
    } else {
        console.log('\nNo HeroRaw found with strategyData.minus');
    }

    await mongoose.connection.close();
}

debugRaw().catch(console.error);
