const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[SyncLore] Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('[SyncLore] Running sync to fetch Lore and fix Skin Names...');
        // We use 'skins' scope because it triggers Liquipedia fetch (needed for names AND lore)
        // and my updated service maps 'lore' whenever detailed data is present.

        const result = await syncHoKMeta({
            scopes: ['skins'],
            logger: console,
            healForce: true,
            staticFile: 'hok-ranklist.sample.json'
        });

        console.log('[SyncLore] Completed.', result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
