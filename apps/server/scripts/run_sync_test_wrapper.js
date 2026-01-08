const path = require('path');
// Set the env var programmatically
process.env.HOK_RANKLIST_JSON_FILE = path.join(__dirname, '..', 'temp_hero_stats.json');
console.log('[WRAPPER] Setting HOK_RANKLIST_JSON_FILE to:', process.env.HOK_RANKLIST_JSON_FILE);

// Run the original script
require('./syncHoKMeta.js');
