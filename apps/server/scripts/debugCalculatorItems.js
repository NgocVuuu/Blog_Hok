const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('../models/Equipment');

async function debugItems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const names = ['Doomsday', 'Endless Blade'];
        const items = await Equipment.find({ name: { $in: names } });

        console.log(`Found ${items.length} items`);
        items.forEach(item => {
            console.log('---');
            console.log(`Name: ${item.name}`);
            console.log('Attributes:', item.attributes);
            console.log('Stats (Legacy):', item.stats); // Check if this field exists
            console.log('Full Object Keys:', Object.keys(item.toObject()));
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

debugItems();
