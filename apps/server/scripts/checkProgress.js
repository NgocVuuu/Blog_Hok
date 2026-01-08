const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const total = await Hero.countDocuments({});
        const hasImage = await Hero.countDocuments({ image: { $exists: true, $ne: '' } });
        const hasRoles = await Hero.countDocuments({ roles: { $exists: true, $not: { $size: 0 } } });
        const hasLanes = await Hero.countDocuments({ lanes: { $exists: true, $not: { $size: 0 }, $ne: ['Unknown'] } }); // Check non-unknown lanes

        const missingLanes = await Hero.find({ $or: [{ lanes: { $size: 0 } }, { lanes: 'Unknown' }] }).select('name').limit(10).lean();
        const missingRoles = await Hero.find({ roles: { $size: 0 } }).select('name').limit(10).lean();

        console.log(`Total: ${total}`);
        console.log(`With Image: ${hasImage} (${(hasImage / total * 100).toFixed(1)}%)`);
        console.log(`With Roles: ${hasRoles} (${(hasRoles / total * 100).toFixed(1)}%)`);
        console.log(`With Lanes: ${hasLanes} (${(hasLanes / total * 100).toFixed(1)}%)`);

        if (missingRoles.length > 0) {
            console.log('Missing Roles (First 10):', missingRoles.map(h => h.name).join(', '));
        }
        if (missingLanes.length > 0) {
            console.log('Missing Lanes (First 10):', missingLanes.map(h => h.name).join(', '));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
