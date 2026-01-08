const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[SyncSkins] Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('[SyncSkins] Running with scope: ["skins"]');
        console.log('NOTE: This will scan CN server for skin images (1-15) for ALL heroes and upload them.');

        const result = await syncHoKMeta({
            scopes: ['skins'],
            logger: console,
            healForce: true, // Force to ensure we process even if no other changes
            staticFile: 'hok-ranklist.sample.json'
        });

        console.log('[SyncSkins] Completed.', result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
