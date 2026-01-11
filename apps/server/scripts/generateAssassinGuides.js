const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const News = require('../models/News');
const { DraftGeneratorService } = require('../services/draftGeneratorService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function generateAssassinGuides() {
    if (!process.env.MONGODB_URI) throw new Error('No DB URI');
    await mongoose.connect(process.env.MONGODB_URI);

    // Find all Assassins
    // Note: The role string might be "Assassin" or lower case, using regex for safety
    const assassins = await Hero.find({ roles: { $in: [/^Assassin/i] } });
    console.log(`Found ${assassins.length} Assassin heroes.`);

    const generator = new DraftGeneratorService();
    let count = 0;

    for (const hero of assassins) {
        console.log(`Generating guide for: ${hero.name}...`);

        // Check if draft already exists to avoid duplicates (optional but good practice)
        const exists = await News.findOne({
            title: `Counter Guide: How to Shut Down ${hero.name}`,
            status: 'draft'
        });

        if (exists) {
            console.log(`-> Draft already exists. Skipping.`);
            continue;
        }

        const draft = await generator.generateCounterGuide(hero);

        if (draft) {
            await News.create(draft);
            console.log(`-> Created.`);
            count++;
        } else {
            console.log(`-> Failed (likely no strategy data).`);
        }
    }

    console.log(`\nSuccessfully created ${count} new generic counter guides.`);
    await mongoose.connection.close();
}

generateAssassinGuides().catch(console.error);
