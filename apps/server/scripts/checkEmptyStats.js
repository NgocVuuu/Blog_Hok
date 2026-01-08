const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('../models/Equipment');

async function checkEmptyStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const items = await Equipment.find({});
        const emptyItems = [];

        items.forEach(item => {
            // Check attributes
            let hasAttributes = false;
            if (item.attributes) {
                const values = Object.values(item.attributes.toObject ? item.attributes.toObject() : item.attributes);
                // Check if any value is > 0
                if (values.some(v => typeof v === 'number' && v > 0)) {
                    hasAttributes = true;
                }
            }

            // Check quickStats
            const hasQuickStats = item.quickStats && item.quickStats.length > 0;

            if (!hasAttributes) {
                emptyItems.push({
                    name: item.name,
                    hasQuickStats: hasQuickStats,
                    price: item.price
                });
            }
        });

        if (emptyItems.length > 0) {
            console.log(`Found ${emptyItems.length} items with NO stats (attributes):`);
            emptyItems.forEach(i => {
                console.log(`- ${i.name} (Price: ${i.price}) [Has QuickStats: ${i.hasQuickStats}]`);
            });
        } else {
            console.log('All items have at least one attribute > 0.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkEmptyStats();
