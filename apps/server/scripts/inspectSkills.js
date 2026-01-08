const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const heroes = ['Daji', 'Chicha'];
        for (const name of heroes) {
            console.log(`\n--- Inspecting: ${name} ---`);
            const h = await Hero.findOne({ name: name }).lean();
            if (!h) {
                console.log('Not Found');
                continue;
            }

            console.log(`Source ID: ${h._id}`);

            if (h.skills && h.skills.length > 0) {
                console.log(`Skills Count: ${h.skills.length}`);
                h.skills.forEach((s, i) => {
                    console.log(`  [${i + 1}] ${s.name} (Icon: ${s.icon ? 'Yes' : 'No'})`);
                    // console.log(`      Desc: ${s.description ? s.description.substring(0, 50) + '...' : 'N/A'}`);
                });
            } else {
                console.log('Skills: [Empty]');
            }

            if (h.skillBuilds && h.skillBuilds.length > 0) {
                console.log(`Skill Builds: ${h.skillBuilds.length}`);
                h.skillBuilds.forEach(b => {
                    console.log(`  Form: ${b.name} (${b.skills.length} skills)`);
                });
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
