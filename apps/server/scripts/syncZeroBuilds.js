const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');
const Hero = require('../models/Hero');

// List of heroes identified as having 0 builds from analysis
// 'Gao Changgong', 'Arke', 'Augran', 'Arthur', 'Cai Yan', 'Luban No.7' + others from full list
// We will query DB to find them dynamically to include all 14.

(async () => {
    try {
        console.log('[SyncZero] Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        // Find heroes with 0 builds
        const zeroBuildHeroes = await Hero.find({ $or: [{ itemBuilds: { $size: 0 } }, { itemBuilds: { $exists: false } }] });
        console.log(`[SyncZero] Found ${zeroBuildHeroes.length} heroes with 0 builds.`);

        if (zeroBuildHeroes.length === 0) {
            console.log('No heroes to sync.');
            return;
        }

        const directData = zeroBuildHeroes.map(h => ({
            heroId: h.id,
            name: h.name
        }));

        console.log(`[SyncZero] Starting Targeted Sync for: ${directData.map(h => h.name).join(', ')}`);

        // Sync with a clean slate for these heroes
        const result = await syncHoKMeta({
            logger: console,
            dryRun: false,
            scopes: ['builds'],
            directData: directData,
            healForce: true
        });

        console.log('[SyncZero] Result:', result);

    } catch (err) {
        console.error('[SyncZero] Error:', err);
    } finally {
        await mongoose.disconnect();
    }
})();
