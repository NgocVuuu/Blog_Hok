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
        const staticFile = path.join(__dirname, '..', 'hok-ranklist.sample.json');
        console.log('Using static file:', staticFile);

        console.log('Starting SMART HEAL update (Only broken heroes)...');

        const result = await syncHoKMeta({
            dryRun: false,
            logger: console,
            staticFile: staticFile,
            healSmart: true
        });

        console.log('Smart Heal Sync Result:', JSON.stringify(result, null, 2));
        process.exit(0);

    } catch (e) {
        console.error('Fatal Error:', e.message);
        console.error(e.stack);
        process.exit(1);
    }
})();
