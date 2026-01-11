const mongoose = require('mongoose');
const DraftChange = require('../models/DraftChange');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function cleanDrafts() {
    if (!process.env.MONGODB_URI) throw new Error('No DB URI');
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete pending NEW_SKIN drafts
    // We clear all because the scraping logic was flawed globally
    const result = await DraftChange.deleteMany({
        type: 'NEW_SKIN',
        status: 'PENDING'
    });

    console.log(`Deleted ${result.deletedCount} pending NEW_SKIN drafts.`);

    // Also check for any NEW_HERO drafts for "Chicha" if they were contaminated with bad payload?
    // Probably safe now.

    await mongoose.connection.close();
}

cleanDrafts().catch(console.error);
