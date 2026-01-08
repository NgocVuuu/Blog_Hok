const mongoose = require('mongoose');
const { syncHoKMeta } = require('../services/syncHoKMetaService');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const healFile = path.join(__dirname, '..', 'heroes_to_heal.json');
        console.log('Using heal file:', healFile);

        // Run sync with healForce
        const result = await syncHoKMeta({
            dryRun: false,
            logger: console,
            staticFile: healFile,
            healForce: true
        });

        console.log('Sync Result:', JSON.stringify(result, null, 2));

    } catch (e) {
        console.error('Fatal Error:', e.message);
        fs.writeFileSync('last_run_error.log', e.stack || e.message);
    } finally {
        await mongoose.disconnect();
    }
})();
