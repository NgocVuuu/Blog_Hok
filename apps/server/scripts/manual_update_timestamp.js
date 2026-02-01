const mongoose = require('mongoose');
const SiteInfo = require('../models/SiteInfo');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateTimestamp = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected.');

        const result = await SiteInfo.findOneAndUpdate(
            { key: 'heroes_meta_updated' },
            { key: 'heroes_meta_updated', updatedAt: new Date() },
            { upsert: true, new: true }
        );

        console.log('Updated Timestamp:', result);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
};

updateTimestamp();
