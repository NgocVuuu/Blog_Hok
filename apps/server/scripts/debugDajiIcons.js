const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const heroes = await Hero.find({ name: 'Daji' });

        heroes.forEach((hero, index) => {
            console.log(`\n--- Hero #${index + 1}: ${hero.name} (ID: ${hero._id}) ---`);
            hero.skills.forEach((s, i) => {
                console.log(`[Skill ${i}] Name: ${s.name}`);
                console.log(`          Icon: ${s.icon}`);
            });
            console.log('--- Skill Builds ---');
            if (hero.skillBuilds) {
                hero.skillBuilds.forEach((b, i) => {
                    console.log(`[Build ${i}] ${b.name}:`);
                    b.skills.forEach((s, j) => {
                        console.log(`    - ${s.name}: ${s.icon}`);
                    });
                });
            }
        });
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
})();
