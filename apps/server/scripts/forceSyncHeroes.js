const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[ForceSync] Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[ForceSync] Connected.');

        // Use the found sample file which maps IDs correctly
        const STATIC_FILE = 'hok-ranklist.sample.json';
        const fs = require('fs');

        // Load Static Stats
        let staticStats = [];
        try {
            const raw = fs.readFileSync(path.join(__dirname, '..', STATIC_FILE), 'utf8');
            const json = JSON.parse(raw);
            // Normalize logic from provider (simplified)
            staticStats = (json.data && json.data.list) ? json.data.list : [];
            console.log(`[ForceSync] Loaded ${staticStats.length} heroes from static file.`);
        } catch (e) {
            console.warn('[ForceSync] Failed to load static file:', e.message);
        }

        // Load DB Heroes
        const dbHeroes = await Hero.find({}, 'name slug').lean();
        console.log(`[ForceSync] Loaded ${dbHeroes.length} heroes from DB.`);

        // Merge: Add DB heroes that are missing from Static Stats
        const mergedStats = [...staticStats];
        const existingNames = new Set(staticStats.map(s => s.heroInfo?.heroName || s.heroName)); // Adjust based on structure

        let added = 0;
        for (const h of dbHeroes) {
            // Check if hero exists in static stats (by name)
            // Note: Static stats might use different name formatting, but let's try direct or simple match
            if (!existingNames.has(h.name)) {
                // Create a stub stat object
                mergedStats.push({
                    name: h.name,
                    heroId: null, // No ID available
                    winRate: 0,
                    pickRate: 0,
                    banRate: 0,
                    metaTier: 'C'
                });
                added++;
            }
        }
        console.log(`[ForceSync] Added ${added} heroes from DB to sync list. Total to process: ${mergedStats.length}`);

        console.log(`[ForceSync] Starting Global Fix Sync with healForce=true...`);
        const result = await syncHoKMeta({
            logger: console,
            dryRun: false,
            healForce: true,
            directData: mergedStats // Pass augmented list directly
        });

        console.log('[ForceSync] Result:', result);
        console.log('[ForceSync] Done.');
    } catch (err) {
        console.error('[ForceSync] Error:', err);
    } finally {
        await mongoose.disconnect();
    }
})();
