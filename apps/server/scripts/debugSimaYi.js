const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[DebugSimaYi] Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        const mergedStats = [{
            name: 'Sima Yi',
            heroId: '137', // Official ID for Sima Yi
            winRate: 0, pickRate: 0, banRate: 0, metaTier: 'B'
        }];

        console.log(`[DebugSimaYi] Starting Sync for Sima Yi...`);
        // Use static file but we rely on the service to find Sima Yi in it.
        // Sima Yi ID is 137. Name "Sima Yi".

        // Pass the static file path
        const result = await syncHoKMeta({
            logger: console,
            dryRun: false,
            healForce: true,
            staticFile: 'hok-ranklist.sample.json',
            // We can't easily filter inside syncHoKMeta without modifying it, 
            // but we can pass directData that ONLY has Sima Yi if we load it first.
        });

        console.log('[DebugSimaYi] Done.');
    } catch (err) {
        console.error('[DebugSimaYi] Error:', err);
    } finally {
        await mongoose.disconnect();
    }
})();
