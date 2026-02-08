require('dotenv').config();
const mongoose = require('mongoose');
const { OfficialNewsScraper } = require('../services/OfficialNewsScraper');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloghok');
        console.log('Connected to DB');

        const scraper = new OfficialNewsScraper();
        const count = await scraper.scrapeOfficialNews();
        
        console.log(`Finished. Created ${count} drafts.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();