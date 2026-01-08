const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const HeroDetailFetcher = require('../services/heroDetailFetcher');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), 'apps', 'server', '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloghok';

async function manualUpdate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('DB Connected');

        const fetcher = new HeroDetailFetcher(console);
        console.log('Fetching Liquipedia data...');
        const liqData = await fetcher.fetchLiquipediaData('Chicha');

        console.log('Scraped Data:');
        console.log('  Skins:', liqData.skins);
        console.log('  Lanes:', liqData.lanes);

        if (liqData.skillBuilds) {
            const buildKeys = Object.keys(liqData.skillBuilds);
            console.log(`  Skill Builds Found: ${buildKeys.length} (${buildKeys.join(', ')})`);

            const finalSkillBuilds = Object.entries(liqData.skillBuilds).map(([formName, skills]) => ({
                name: formName === 'Default' ? 'Default' : formName,
                skills: skills
            }));

            // Update DB
            const res = await Hero.updateOne(
                { slug: 'chicha' },
                { $set: { skillBuilds: finalSkillBuilds } }
            );
            console.log('Update Result:', res);
        } else {
            console.log('No skill builds found in scraped data!');
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
        await mongoose.disconnect();
    }
}

manualUpdate();
