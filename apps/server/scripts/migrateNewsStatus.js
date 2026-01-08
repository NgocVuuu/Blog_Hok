const mongoose = require('mongoose');
const News = require('../models/News');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrateStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected.');

        // Update all posts where status is missing
        const result = await News.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'published' } }
        );

        console.log(`Migrated ${result.modifiedCount} old posts to 'published' status.`);

        // Also verify how many total posts
        const total = await News.countDocuments({});
        const published = await News.countDocuments({ status: 'published' });
        const draft = await News.countDocuments({ status: 'draft' });

        console.log(`Total: ${total}, Published: ${published}, Draft: ${draft}`);

    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        await mongoose.connection.close();
    }
};

migrateStatus();
