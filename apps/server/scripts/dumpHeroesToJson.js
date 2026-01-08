const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const heroes = await Hero.find({}).lean();

        const brokenHeroes = heroes.filter(h => {
            const missingImage = !h.image || h.image === '';
            const missingLanes = !h.lanes || h.lanes.length === 0 || (h.lanes.length === 1 && h.lanes[0] === 'Unknown');
            const missingSkills = !h.skills || h.skills.length === 0;
            const missingTitle = !h.title || h.title === 'New Hero' || h.title === 'Hero';
            return missingImage || missingLanes || missingSkills || missingTitle;
        });

        // Format as expected by sync service
        const stats = brokenHeroes.map(h => ({
            name: h.name,
            heroId: undefined,
            metaTier: 'B',
            winRate: 0.5,
            pickRate: 0.1,
            banRate: 0.1
        }));

        const outFile = path.join(__dirname, '..', 'heroes_dump.json');
        fs.writeFileSync(outFile, JSON.stringify(stats, null, 2));
        console.log(`Dumped ${stats.length} BROKEN heroes to ${outFile}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
