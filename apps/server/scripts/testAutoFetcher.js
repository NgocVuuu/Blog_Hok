#!/usr/bin/env node
/**
 * Manual test script for HoK Auto Fetcher
 * Run with: node scripts/testAutoFetcher.js
 */

const path = require('path');
const dotenv = require('dotenv');

// Load env
const serverEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serverEnvPath });

const { fetchHeroStats, fetchAndSync } = require('../services/hokAutoFetcher');

async function testFetchOnly() {
    console.log('\n========================================');
    console.log('TEST 1: Fetch Data Only (No Sync)');
    console.log('========================================\n');

    try {
        const result = await fetchHeroStats({
            headless: true,
            saveToFile: true
        });

        console.log('\n✅ Fetch Success!');
        console.log(`- Heroes: ${result.stats.heroCount}`);
        console.log(`- Update Time: ${result.stats.updateTime}`);
        console.log(`- Timestamp: ${result.stats.timestamp}`);
    } catch (error) {
        console.error('\n❌ Fetch Failed:', error.message);
    }
}

async function testFetchAndSync() {
    console.log('\n========================================');
    console.log('TEST 2: Fetch + Sync to Database');
    console.log('========================================\n');

    try {
        const { connectDB } = require('../config/db');
        await connectDB();

        const result = await fetchAndSync();

        console.log('\n✅ Fetch & Sync Success!');
        console.log('\nFetch Results:');
        console.log(`- Heroes fetched: ${result.fetch.heroCount}`);
        console.log(`- Update time: ${result.fetch.updateTime}`);

        console.log('\nSync Results:');
        console.log(`- Matched: ${result.sync.matched}`);
        console.log(`- Updated: ${result.sync.updated}`);
        console.log(`- Missing: ${result.sync.missing}`);

        if (result.sync.unmatched && result.sync.unmatched.length > 0) {
            console.log(`\n⚠️  Unmatched Heroes (${result.sync.unmatched.length}):`);
            result.sync.unmatched.forEach(u => {
                console.log(`   - ${u.sourceName}`);
            });
        }

        // --- NEW: Add Secondary Tasks (Discovery & News) ---
        // Originally in hokMetaScheduler.js
        console.log('\n========================================');
        console.log('STEP 3: Running Additional Tasks (Discovery & Drafts)');
        console.log('========================================\n');

        const { HoKDiscoveryService } = require('../services/hokDiscoveryService');
        const { HoKMetaSyncScheduler } = require('../services/hokMetaScheduler');

        // Use a dummy scheduler instance just to access methods if needed, 
        // OR better: Instantiate DiscoveryService directly.
        const discovery = new HoKDiscoveryService();
        console.log('[Task] Scanning for New Heroes...');
        await discovery.scanForNewHeroes();

        console.log('[Task] Scanning for New Skins...');
        await discovery.scanForNewSkins();

        // For drafts, we need the scheduler instance or move logic. 
        // Let's create a temporary scheduler instance to run the draft logic.
        const scheduler = new HoKMetaSyncScheduler();
        console.log('[Task] Generating Weekly News Drafts...');
        await scheduler.generateWeeklyDrafts();

        console.log('\n✅ All Secondary Tasks Completed!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Fetch & Sync Failed:', error.message);
        process.exit(1);
    }
}

// Choose test mode
const args = process.argv.slice(2);
const mode = args[0] || 'fetch-only';

(async () => {
    if (mode === 'fetch-only') {
        await testFetchOnly();
        process.exit(0);
    } else if (mode === 'full') {
        await testFetchAndSync();
    } else {
        console.error('Usage: node scripts/testAutoFetcher.js  [fetch-only|full]');
        process.exit(1);
    }
})();
