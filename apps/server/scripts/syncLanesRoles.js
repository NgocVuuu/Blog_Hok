#!/usr/bin/env node
/**
 * Manual Script: Sync Lanes, Roles & Stats (with Heal Force)
 * Run this to manually update:
 * - Lanes (e.g. "Clash Lane")
 * - Roles (e.g. "Fighter", "Assassin")
 * - Stats (Win/Pick/Ban Rates, Tiers)
 */

const path = require('path');
const dotenv = require('dotenv');

// Load env
const serverEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serverEnvPath });

const { fetchAndSync } = require('../services/hokAutoFetcher');
const { connectDB } = require('../config/db');

async function run() {
    console.log('\n========================================');
    console.log('MANUAL SYNC: LANES, ROLES & STATS');
    console.log('========================================\n');

    try {
        await connectDB();

        // Custom logger to see detail process
        const debugLogger = {
            info: (msg) => console.log(msg),
            warn: (msg) => console.warn(msg),
            error: (msg) => console.error(msg)
        };

        console.log('[Info] Starting manual sync for scopes: lanes, roles, stats...');

        const result = await fetchAndSync({
            scopes: ['lanes', 'roles', 'stats'],
            logger: debugLogger,
            healForce: true
        });

        console.log('\n✅ Sync Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Sync Failed:', error.message);
        process.exit(1);
    }
}

run();
