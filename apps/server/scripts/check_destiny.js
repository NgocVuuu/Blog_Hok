const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/ADMIN/OneDrive - swqpz/Desktop/BlogHok/apps/server/.env' });
const Equipment = require('c:/Users/ADMIN/OneDrive - swqpz/Desktop/BlogHok/apps/server/models/Equipment');

const checkEquipment = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const item = await Equipment.findOne({ name: 'Destiny' });
        if (item) {
            console.log('Found Item:');
            console.log(JSON.stringify(item, null, 2));
        } else {
            console.log('Item not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkEquipment();
