const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const listEquip = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const equips = await Equipment.find({}).sort({ name: 1 });

        console.log('--- HoK Equipment List ---');
        equips.forEach(e => {
            console.log(e.name);
        });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

listEquip();
