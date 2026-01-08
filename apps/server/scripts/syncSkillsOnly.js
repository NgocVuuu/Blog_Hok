const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[SyncSkills] Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('[SyncSkills] Running with scope: ["skills"]');
        console.log('NOTE: This will fetch skills and upload icons to Cloudinary for ALL heroes.');

        const result = await syncHoKMeta({
            scopes: ['skills'],
            logger: console,
            healForce: true,
            staticFile: 'hok-ranklist.sample.json'
        });

        console.log('[SyncSkills] Completed.', result);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
