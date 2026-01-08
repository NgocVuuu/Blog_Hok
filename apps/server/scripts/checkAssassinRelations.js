const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const checkRelations = async () => {
    await connectDB();

    try {
        const assassins = await Hero.find({ roles: 'Assassin' }).populate('counters.hero');

        console.log(`\nFound ${assassins.length} Assassins total.`);

        const valid = assassins.filter(h => h.counters && h.counters.length > 0);

        console.log(`\n--- Assassins with Counters Data (${valid.length}) ---`);
        valid.forEach(h => {
            const counterNames = h.counters.map(c => c.hero ? c.hero.name : 'Unknown').join(', ');
            console.log(`[${h.name}]: Counters -> ${counterNames}`);
        });

        console.log('\n----------------------------------------------');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

checkRelations();
