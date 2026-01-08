const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[SyncStats] Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('[SyncStats] Running with scope: ["stats"]');
        const result = await syncHoKMeta({
            scopes: ['stats'],
            logger: console,
            staticFile: 'hok-ranklist.sample.json' // Or auto-load
        });

        console.log('[SyncStats] Completed.', result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
