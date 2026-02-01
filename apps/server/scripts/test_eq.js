const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkEquipment = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const items = await Equipment.find({ name: { $in: ['Spikemail', 'Sage\'s Sanctuary', 'Unknown Item'] } });
        items.forEach(i => console.log(`${i.name}: ${i.image}`));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
};
checkEquipment();
