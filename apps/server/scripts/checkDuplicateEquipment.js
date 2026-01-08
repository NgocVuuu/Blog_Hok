const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('../models/Equipment');

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const duplicates = await Equipment.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate equipment names:`);
            duplicates.forEach(d => {
                console.log(`- "${d._id}": ${d.count} entries (IDs: ${d.ids.join(', ')})`);
            });
        } else {
            console.log('No duplicate equipment names found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDuplicates();
