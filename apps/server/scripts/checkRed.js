const mongoose = require('mongoose');
const Arcana = require('../models/Arcana');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function checkRed() {
    if (!process.env.MONGODB_URI) process.exit(1);
    await mongoose.connect(process.env.MONGODB_URI);

    const reds = await Arcana.find({ color: 'red' }).sort({ name: 1 });
    console.log(`Red Arcanas found: ${reds.length}`);
    reds.forEach(r => console.log(`- ${r.name} (ID: ${r._id})`));

    await mongoose.connection.close();
}

checkRed().catch(console.error);
