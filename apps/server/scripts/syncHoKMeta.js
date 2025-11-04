#!/usr/bin/env node
/*
  CLI to sync HoK meta stats into the database.
  Usage:
    node scripts/syncHoKMeta.js            # real run
    node scripts/syncHoKMeta.js --dry-run  # preview changes
  Env required:
    MONGODB_URI
    HOK_RANKLIST_INLINE_JSON or HOK_RANKLIST_JSON_FILE
*/

// Load environment variables first (server .env then root .env)
const path = require('path');
const dotenv = require('dotenv');
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
const envLoaded = dotenv.config({ path: serverEnvPath });
if (envLoaded.error) {
  dotenv.config({ path: rootEnvPath });
}

const { connectDB } = require('../config/db');
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  try {
    if (process.env.DEBUG_HOK === '1') {
      console.log('[HoK Sync] Debug env:');
      console.log('  HOK_RANKLIST_JSON_FILE:', process.env.HOK_RANKLIST_JSON_FILE || '(not set)');
      console.log('  HOK_RANKLIST_INLINE_JSON:', process.env.HOK_RANKLIST_INLINE_JSON ? '(set)' : '(not set)');
    }
    await connectDB();
    const res = await syncHoKMeta({ dryRun });
    console.log('[HoK Sync] Result:', JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('[HoK Sync] Error:', err && (err.stack || err.message) || err);
    process.exit(1);
  }
})();
