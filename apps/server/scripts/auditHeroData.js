const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const heroes = await Hero.find({}).lean();
        console.log(`Total Heroes: ${heroes.length}`);

        const missingTitle = [];
        const missingRole = [];
        const missingLane = [];
        const missingSkills = [];
        const missingSkins = [];

        heroes.forEach(h => {
            if (!h.title || h.title === 'Hero') missingTitle.push(h.name);
            if (!h.roles || h.roles.length === 0) missingRole.push(h.name);
            if (!h.lanes || h.lanes.length === 0 || (h.lanes.length === 1 && h.lanes[0] === 'Unknown')) missingLane.push(h.name);
            if (!h.skills || h.skills.length === 0) missingSkills.push(h.name);
            if (!h.skins || h.skins.length === 0) missingSkins.push(h.name);
        });

        console.log(`\n--- Summary ---`);
        console.log(`Missing Title: ${missingTitle.length}`);
        console.log(`Missing Role: ${missingRole.length}`);
        console.log(`Missing Lane: ${missingLane.length}`);
        console.log(`Missing Skills: ${missingSkills.length}`);
        console.log(`Missing Skins: ${missingSkins.length}`);

        console.log(`\n--- Details ---`);
        if (missingTitle.length > 0) console.log('Missing Title:', missingTitle.slice(0, 10), missingTitle.length > 10 ? '...' : '');
        if (missingRole.length > 0) console.log('Missing Role:', missingRole.slice(0, 10), missingRole.length > 10 ? '...' : '');
        if (missingLane.length > 0) console.log('Missing Lane:', missingLane.slice(0, 10), missingLane.length > 10 ? '...' : '');
        if (missingSkills.length > 0) console.log('Missing Skills:', missingSkills.slice(0, 10), missingSkills.length > 10 ? '...' : '');
        if (missingSkins.length > 0) console.log('Missing Skins:', missingSkins.slice(0, 10), missingSkins.length > 10 ? '...' : '');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
