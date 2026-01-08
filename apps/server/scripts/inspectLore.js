const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const heroes = await Hero.find({}, 'name lore slug');
        let hasLore = 0;
        let noLore = 0;

        console.log('--- Random Sample ---');
        const sample = heroes.sort(() => 0.5 - Math.random()).slice(0, 5);
        sample.forEach(h => {
            console.log(`[${h.name}] Lore Length: ${h.lore ? h.lore.length : 0}`);
            if (h.lore) console.log(`   Preview: ${h.lore.substring(0, 50)}...`);
        });

        heroes.forEach(h => {
            if (h.lore && h.lore.length > 0) hasLore++;
            else noLore++;
        });

        console.log('\n--- Summary ---');
        console.log(`Heroes with Lore: ${hasLore}`);
        console.log(`Heroes without Lore: ${noLore}`);

        if (noLore > 0) {
            console.log('Examples without Lore:', heroes.filter(h => !h.lore || h.lore.length < 5).slice(0, 10).map(h => h.name));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
