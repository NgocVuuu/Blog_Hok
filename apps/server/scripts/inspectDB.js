const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const names = ["Consort Yu", "Ao'yin"];
        for (const name of names) {
            const h = await Hero.findOne({ name });
            if (h) {
                console.log(`\n=== ${h.name} ===`);
                console.log(`Builds Count: ${h.itemBuilds ? h.itemBuilds.length : 0}`);
                if (h.itemBuilds) {
                    h.itemBuilds.forEach((b, i) => {
                        console.log(`  Build ${i + 1}: ${b.name} (${b.items.length} items)`);
                    });
                }
            } else {
                console.log(`Hero ${name} not found.`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
