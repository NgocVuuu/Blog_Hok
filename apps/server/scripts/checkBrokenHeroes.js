const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find heroes with potential issues
        const heroes = await Hero.find({}).lean();

        const broken = heroes.filter(h => {
            const missingImage = !h.image || h.image === '';
            const missingLanes = !h.lanes || h.lanes.length === 0 || (h.lanes.length === 1 && h.lanes[0] === 'Unknown');
            const missingSkills = !h.skills || h.skills.length === 0;
            const missingTitle = !h.title || h.title === 'New Hero' || h.title === 'Hero'; // "Hero" was fallback

            return missingImage || missingLanes || missingSkills || missingTitle;
        });

        console.log(`checked ${heroes.length} heroes.`);
        console.log(`found ${broken.length} potentially broken heroes.`);

        if (broken.length > 0) {
            console.log('Broken heroes:', broken.map(h => `${h.name} (img:${!h.image}, lanes:${h.lanes.length}, skills:${h.skills.length})`).join(', '));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
