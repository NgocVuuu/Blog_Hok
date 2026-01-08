const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Identify broken heroes names
        const allHeroes = await Hero.find({}).lean();
        const brokenNames = new Set(allHeroes.filter(h => {
            const missingImage = !h.image || h.image === '';
            const missingLanes = !h.lanes || h.lanes.length === 0 || (h.lanes.length === 1 && h.lanes[0] === 'Unknown');
            const missingSkills = !h.skills || h.skills.length === 0;
            const missingTitle = !h.title || h.title === 'New Hero' || h.title === 'Hero';
            return missingImage || missingLanes || missingSkills || missingTitle;
        }).map(h => h.name));

        console.log(`Found ${brokenNames.size} broken heroes in DB.`);

        // 2. Read the full list with valid IDs
        const fullListPath = path.join(__dirname, '..', 'hok-ranklist.sample.json');
        if (!fs.existsSync(fullListPath)) {
            throw new Error(`File not found: ${fullListPath}`);
        }
        const fullData = JSON.parse(fs.readFileSync(fullListPath, 'utf8'));
        const fullList = fullData.data ? fullData.data.list : fullData;

        // 3. Filter
        const heroesToHeal = fullList.filter(h => {
            const name = h.heroInfo?.heroName || h.name || h.heroName;
            return brokenNames.has(name);
        });

        console.log(`Matched ${heroesToHeal.length} heroes from ranklist to heal.`);

        // 4. Save
        const outPath = path.join(__dirname, '..', 'heroes_to_heal.json');
        fs.writeFileSync(outPath, JSON.stringify(heroesToHeal, null, 2));
        console.log(`Saved clean heal list to ${outPath}`);

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
