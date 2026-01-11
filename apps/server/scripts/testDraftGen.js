const mongoose = require('mongoose');
const { DraftGeneratorService } = require('../services/draftGeneratorService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testGen() {
    if (!process.env.MONGODB_URI) throw new Error('No DB URI');
    await mongoose.connect(process.env.MONGODB_URI);

    const service = new DraftGeneratorService();

    console.log('--- Generating Meta Report ---');
    const report = await service.generateMetaReport();
    console.log(report.content.substring(0, 500) + '...'); // Show first 500 chars

    console.log('\n--- Generating Counter Guide ---');
    const guide = await service.generateCounterGuide();
    if (guide) {
        console.log(guide.content.substring(0, 500) + '...');
    } else {
        console.log('No counter guide generated (maybe no data).');
    }

    await mongoose.connection.close();
}

testGen().catch(console.error);
