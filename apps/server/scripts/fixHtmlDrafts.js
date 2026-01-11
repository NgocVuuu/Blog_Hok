const mongoose = require('mongoose');
const News = require('../models/News');
const { DraftGeneratorService } = require('../services/draftGeneratorService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function fixDrafts() {
    if (!process.env.MONGODB_URI) throw new Error('No DB URI');
    await mongoose.connect(process.env.MONGODB_URI);

    const drafts = await News.find({ status: 'draft' });
    console.log(`Found ${drafts.length} drafts.`);

    const generator = new DraftGeneratorService();
    const metaReportData = await generator.generateMetaReport();

    let fixedCount = 0;

    for (const draft of drafts) {
        // Simple check for HTML
        if (draft.content.includes('<h2>') || draft.content.includes('<p>')) {
            console.log(`Fixing HTML draft: ${draft.title}`);

            // If it looks like a Meta Report, replace with new Markdown version
            if (draft.title.includes('Weekly Meta Report')) {
                draft.content = metaReportData.content;
                draft.summary = metaReportData.summary; // Update summary too just in case
                await draft.save();
                console.log('-> Replaced with new Markdown content.');
                fixedCount++;
            } else {
                console.log('-> Skipping (unknown type or custom draft).');
            }
        }
    }

    console.log(`Fixed ${fixedCount} drafts.`);
    await mongoose.connection.close();
}

fixDrafts().catch(console.error);
