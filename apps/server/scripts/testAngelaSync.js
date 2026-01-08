const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');
const { syncHoKMeta } = require('../services/syncHoKMetaService');

(async () => {
    try {
        console.log('[TestSync] Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[TestSync] Connected.');

        // Load static file to find Angela
        const STATIC_FILE = 'hok-ranklist.sample.json';
        const fs = require('fs');
        const raw = fs.readFileSync(path.join(__dirname, '..', STATIC_FILE), 'utf8');
        const json = JSON.parse(raw);
        const allList = (json.data && json.data.list) ? json.data.list : [];

        const target = allList.find(x => x.heroInfo?.heroName === 'Angela' || x.heroName === 'Angela' || x.heroId === 142);

        if (!target) {
            console.error('Angela not found in sample file');
            process.exit(1);
        }

        // Ensure name property exists for sync service
        target.name = target.heroName || target.heroInfo?.heroName || 'Angela';

        console.log(`[TestSync] Found Angela: ${target.name} (ID: ${target.heroId})`);

        // Run sync for just this one hero (Builds only)
        const result = await syncHoKMeta({
            dryRun: false,
            healForce: true,
            scopes: ['builds'],
            directData: [target],
            logger: console
        });

        console.log('[TestSync] Result:', result);

        // Verify Builds in DB
        const hero = await Hero.findOne({ name: 'Angela' });
        console.log('--- DB Verification ---');
        console.log(`itemBuilds Count: ${hero.itemBuilds ? hero.itemBuilds.length : 0}`);
        if (hero.itemBuilds) {
            hero.itemBuilds.forEach(b => console.log(`- ${b.name}: ${b.items.join(', ')}`));
        }
        console.log(`arcanaBuilds Count: ${hero.arcanaBuilds ? hero.arcanaBuilds.length : 0}`);
        if (hero.arcanaBuilds) {
            hero.arcanaBuilds.forEach(b => console.log(`- ${b.name}: ${b.items.length} items`));
        }

        console.log(`suggestedEquipment Count: ${hero.suggestedEquipment ? hero.suggestedEquipment.length : 0}`);
        if (hero.suggestedEquipment) {
            const buildCounts = {};
            hero.suggestedEquipment.forEach(e => {
                const b = e.build || 1;
                buildCounts[b] = (buildCounts[b] || 0) + 1;
            });
            console.log('suggestedEquipment Builds:', buildCounts);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
