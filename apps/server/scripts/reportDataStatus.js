const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const heroes = await Hero.find({}).lean();
        console.log(`Total Heroes Found: ${heroes.length}`);

        let hasAvatar = 0;
        let hasBanner = 0;
        let hasLane = 0;
        let hasRole = 0;
        let hasStats = 0; // Win/Pick/Ban rate > 0
        let hasItemBuilds = 0;
        let hasArcanaBuilds = 0;
        let hasSkills = 0;

        const missingDetails = [];

        for (const h of heroes) {
            const hasAv = h.avatar && h.avatar.length > 5;
            const hasBan = (h.cover && h.cover.length > 5) || (h.bannerImage && h.bannerImage.length > 5);
            const hasL = h.lanes && h.lanes.length > 0 && h.lanes[0] !== 'Unknown';
            const hasR = h.roles && h.roles.length > 0;
            const hasS = (h.winRate > 0 || h.pickRate > 0);
            const hasIB = h.itemBuilds && h.itemBuilds.length > 0;
            const hasAB = h.arcanaBuilds && h.arcanaBuilds.length > 0;
            const hasSk = h.skills && h.skills.length > 0;

            if (hasAv) hasAvatar++;
            if (hasBan) hasBanner++;
            if (hasL) hasLane++;
            if (hasR) hasRole++;
            if (hasS) hasStats++;
            if (hasIB) hasItemBuilds++;
            if (hasAB) hasArcanaBuilds++;
            if (hasSk) hasSkills++;

            if (!hasAv || !hasL || !hasR || !hasIB) {
                missingDetails.push({
                    name: h.name,
                    missing: [
                        !hasAv ? 'Avatar' : '',
                        !hasL ? 'Lane' : '',
                        !hasR ? 'Role' : '',
                        !hasIB ? 'Items' : '',
                        !hasAB ? 'Arcana' : ''
                    ].filter(Boolean).join(', ')
                });
            }
        }

        console.log('\n--- DATA COMPLETENESS REPORT ---');
        console.log(`Avatars: ${hasAvatar}/${heroes.length} (${((hasAvatar / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Banners: ${hasBanner}/${heroes.length} (${((hasBanner / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Lanes:   ${hasLane}/${heroes.length}   (${((hasLane / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Roles:   ${hasRole}/${heroes.length}   (${((hasRole / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Stats:   ${hasStats}/${heroes.length}   (${((hasStats / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Items:   ${hasItemBuilds}/${heroes.length}   (${((hasItemBuilds / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Arcana:  ${hasArcanaBuilds}/${heroes.length}   (${((hasArcanaBuilds / heroes.length) * 100).toFixed(1)}%)`);
        console.log(`Skills:  ${hasSkills}/${heroes.length}   (${((hasSkills / heroes.length) * 100).toFixed(1)}%)`);

        if (missingDetails.length > 0) {
            console.log('\n--- EXAMPLES OF MISSING DATA (First 10) ---');
            console.table(missingDetails.slice(0, 10));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
