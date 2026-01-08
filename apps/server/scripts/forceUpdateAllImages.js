const mongoose = require('mongoose');
const { syncHoKMeta } = require('../services/syncHoKMetaService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        // Point to the FULL ranklist file
        // Try relative path from apps/server
        const staticFile = path.join(__dirname, '..', 'hok-ranklist.sample.json');
        console.log('Using full static file:', staticFile);

        console.log('Starting FULL update (Images + Stats) for ALL heroes...');
        console.log('This may take a while...');

        // Run sync with healForce: true to force re-scrape of every hero found in static file
        const result = await syncHoKMeta({
            dryRun: false,
            logger: console,
            staticFile: staticFile,
            healForce: true
        });

        console.log('Full Sync Result:', JSON.stringify(result, null, 2));
        process.exit(0);

    } catch (e) {
        console.error('Fatal Error:', e.message);
        console.error(e.stack);
        process.exit(1);
    }
})();
