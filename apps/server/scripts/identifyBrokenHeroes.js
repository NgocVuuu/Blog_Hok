const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const heroes = await Hero.find({});

        const broken = [];
        for (const h of heroes) {
            let reason = '';
            // Check for low-res/dirty URL
            if (h.image && h.image.includes('?')) reason = 'Dirty Image';
            if (h.bannerImage && h.bannerImage.includes('?')) reason = 'Dirty Banner';

            // Check for missing banner (if fallback logic failed previously)
            if (!h.bannerImage) reason = 'Missing Banner';

            // Check if banner is Wiki (low res) - heuristic
            if (h.bannerImage && h.bannerImage.includes('wikia')) reason = 'Wiki Banner';

            if (reason) {
                console.log(`Hero ${h.name} is broken: ${reason}`);
                broken.push({
                    heroId: 0, // Will be filled by scraper search
                    name: h.name,
                    heroInfo: { heroName: h.name }
                });
            }
        }

        console.log(`Found ${broken.length} broken heroes.`);
        fs.writeFileSync(path.join(__dirname, '..', 'heroes_to_heal.json'), JSON.stringify(broken, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
