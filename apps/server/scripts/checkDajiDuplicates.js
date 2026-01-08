const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const heroes = await Hero.find({ name: 'Daji' });
        console.log(`Found ${heroes.length} heroes named "Daji".`);

        heroes.forEach((h, i) => {
            console.log(`\n[${i}] ID: ${h._id}`);
            console.log(`    Slug: ${h.slug}`);
            console.log(`    Skills: ${h.skills.length}`);
            if (h.skills.length > 0) {
                console.log(`    Skill 0 Icon: ${h.skills[0].icon}`);
            }
        });
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
})();
