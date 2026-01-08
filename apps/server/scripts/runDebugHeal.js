const mongoose = require('mongoose');
const { syncHoKMeta } = require('../services/syncHoKMetaService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const staticFile = path.join(__dirname, '..', 'debug-ranklist.json');
        console.log('Using debug static file:', staticFile);

        const result = await syncHoKMeta({
            dryRun: false,
            logger: console,
            staticFile: staticFile,
            healSmart: true // Ensure this triggers the update logic
        });

        console.log('Debug Sync Result:', JSON.stringify(result, null, 2));
        process.exit(0);

    } catch (e) {
        console.error('Fatal Error:', e.message);
        console.error(e.stack);
        process.exit(1);
    }
})();
