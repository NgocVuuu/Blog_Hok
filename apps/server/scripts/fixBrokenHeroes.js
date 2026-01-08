const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncHoKMeta } = require('../services/syncHoKMetaService');

// List from User Reports
const BROKEN_HEROES = [
    'Gao', 'Han Xin', 'Nakoruru', 'Shouyue', 'Dolia', 'Guan Yu',
    'Li Xin', 'Liu Bei', 'Mayene', 'Menki', 'Nezha', 'Sun Ce',
    'Umbrosa', 'Da Qiao', 'Dr Bian', 'Shi', 'Alessio', 'Ao\'yin',
    'Arli', 'Huang Zhong', 'Luara', 'Dong Huang', 'LapuLapu',
    'Lian Po', 'Lu Bu'
];

(async () => {
    try {
        console.log('[FixBroken] Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log(`[FixBroken] Targeting ${BROKEN_HEROES.length} heroes for repair...`);

        // We need to load static data to get IDs
        // Use the provider to ensure consistent mapping
        const { fetchHeroStatsFromStatic } = require('../services/hokStaticProvider');
        const allHeroes = await fetchHeroStatsFromStatic({ filePath: 'hok-ranklist.sample.json' });

        // Filter
        const filtered = allHeroes.filter(h => {
            return BROKEN_HEROES.some(b =>
                h.name.toLowerCase().includes(b.toLowerCase()) ||
                b.toLowerCase().includes(h.name.toLowerCase())
            );
        });

        console.log(`[FixBroken] Found ${filtered.length} matches in static file.`);

        // Force full heal (fetch Details -> Liquipedia -> Images -> Skins)
        const result = await syncHoKMeta({
            scopes: ['images', 'skins'], // Update Avatars + Skin Names/Images
            logger: console,
            healForce: true,
            directData: filtered
        });

        console.log('[FixBroken] Done.', result);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
