const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('../models/Equipment');

async function debugIronSword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const item = await Equipment.findOne({ name: 'Iron Sword' });
        if (item) {
            console.log('Name:', item.name);
            console.log('QuickStats:', item.quickStats);
            console.log('Attributes:', item.attributes);
        } else {
            console.log('Iron Sword not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugIronSword();
