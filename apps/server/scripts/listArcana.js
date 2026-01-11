const mongoose = require('mongoose');
const Arcana = require('../models/Arcana');
const path = require('path');
// Try server root .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function list() {
    if (!process.env.MONGODB_URI) {
        console.error('Missing MONGODB_URI');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const arcanas = await Arcana.find().sort({ name: 1 }).lean();

    console.log('--- Arcana List ---');
    arcanas.forEach(a => console.log(`${a.name} [${a.color}] (ID: ${a._id})`));

    if (arcanas.length > 0) {
        console.log('\n--- Sample Data Structure ---');
        console.log(JSON.stringify(arcanas[0], null, 2));
    }

    await mongoose.connection.close();
}
list();
