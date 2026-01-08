const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const heroes = await Hero.find({}).lean();
        const toHeal = [];

        for (const h of heroes) {
            let needsHeal = false;
            // Check main image
            if (h.image && (h.image.includes('/revision/') || h.image.includes('scale-to-width'))) {
                needsHeal = true;
            }
            // Check skins
            if (!needsHeal && h.skins && h.skins.length > 0) {
                for (const s of h.skins) {
                    if (s.image && (s.image.includes('/revision/') || s.image.includes('scale-to-width'))) {
                        needsHeal = true;
                        break;
                    }
                }
            }

            if (needsHeal) {
                toHeal.push({
                    heroName: h.name,
                    heroId: 'unknown', // We might not have the ID, sync service will find it or use Wiki
                    forceUpdate: true
                });
            }
        }

        console.log(`Found ${toHeal.length} heroes with low-res images.`);
        if (toHeal.length > 0) {
            fs.writeFileSync(path.join(__dirname, '..', 'heroes_low_res.json'), JSON.stringify(toHeal, null, 2));
            console.log('Written to heroes_low_res.json');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
