const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Check Angela
        const hero = await Hero.findOne({ name: 'Angela' });

        if (!hero) {
            console.log('Hero "Angela" not found in DB yet.');
            return;
        }

        console.log(`\n--- Hero: ${hero.name} ---`);
        console.log(`Skills Count: ${hero.skills.length}`);

        if (hero.skills.length > 0) {
            console.log(`[Skill 0] Name: ${hero.skills[0].name}`);
            console.log(`          Icon: ${hero.skills[0].icon}`); // Should be Cloudinary
        }

        if (hero.skillBuilds && hero.skillBuilds.length > 0) {
            console.log(`\n[SkillBuilds] Count: ${hero.skillBuilds.length}`);
            const firstBuild = hero.skillBuilds[0];
            console.log(`Build Name: ${firstBuild.name}`);
            if (firstBuild.skills.length > 0) {
                console.log(`    - Skill 0 Icon: ${firstBuild.skills[0].icon}`); // Should be Cloudinary
            }
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
})();
