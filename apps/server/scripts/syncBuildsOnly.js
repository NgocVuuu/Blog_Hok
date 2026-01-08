const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[SyncBuilds] Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[SyncBuilds] Connected.');

        // Load static file for hero list
        const STATIC_FILE = 'hok-ranklist.sample.json';
        const fs = require('fs');
        const raw = fs.readFileSync(path.join(__dirname, '..', STATIC_FILE), 'utf8');
        const json = JSON.parse(raw);
        const staticStats = (json.data && json.data.list) ? json.data.list : [];

        console.log(`[SyncBuilds] Starting Build & Arcana Sync for ${staticStats.length} heroes...`);

        // Run sync with ONLY 'builds' scope
        const result = await syncHoKMeta({
            logger: console,
            dryRun: false,
            // scopes: ['builds'] ensures we only update Equipment and Arcana
            scopes: ['builds'],
            directData: staticStats,
            healForce: true // Force fetch official data to ensure we have strategyData
        });

        console.log('[SyncBuilds] Result:', result);
        console.log('[SyncBuilds] Done.');
    } catch (err) {
        console.error('[SyncBuilds] Error:', err);
    } finally {
        await mongoose.disconnect();
    }
})();
