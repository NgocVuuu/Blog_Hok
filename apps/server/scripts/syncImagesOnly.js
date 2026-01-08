const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[SyncImages] Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('[SyncImages] Running with scope: ["images"]');
        console.log('NOTE: This will fetch data and upload to Cloudinary for ALL heroes. This may take a while.');

        const result = await syncHoKMeta({
            scopes: ['images'],
            logger: console,
            healForce: true, // Force fetch to get images
            staticFile: 'hok-ranklist.sample.json'
        });

        console.log('[SyncImages] Completed.', result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
