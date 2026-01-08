const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const heroes = await Hero.find({}).sort({ name: 1 }).lean();

        // CSV Header
        const headers = ['Name', 'ID', 'Avatar URL', 'Banner URL', 'Skin 1', 'Skin 2', 'Skin 3'];
        const rows = [headers.join(',')];

        heroes.forEach(h => {
            const row = [
                `"${h.name}"`,
                `"${h._id}"`,
                `"${h.image || ''}"`,
                `"${h.bannerImage || ''}"`
            ];

            // Add first 3 skins for reference
            if (h.skins && h.skins.length > 0) {
                h.skins.slice(0, 3).forEach(s => {
                    row.push(`"${s.name}: ${s.image || ''}"`);
                });
            }

            rows.push(row.join(','));
        });

        const targetPath = path.join(__dirname, '..', '..', '..', 'hero_images_report.csv');
        fs.writeFileSync(targetPath, rows.join('\n'));
        console.log(`Exported ${heroes.length} heroes to ${targetPath}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
