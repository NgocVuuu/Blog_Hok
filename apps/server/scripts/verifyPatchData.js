const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: serverEnvPath });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: rootEnvPath });
}
const { connectDB } = require('../config/db');
const Hero = require('../models/Hero');

async function verify() {
    await connectDB();
    const hero = await Hero.findOne({ name: 'Daji' });
    if (hero) {
        console.log(`Hero: ${hero.name}`);
        console.log(`Patch Notes Count: ${hero.patchNotes ? hero.patchNotes.length : 0}`);
        if (hero.patchNotes && hero.patchNotes.length > 0) {
            console.log('Sample Note:', JSON.stringify(hero.patchNotes[0], null, 2));
        }
    } else {
        console.log('Hero Daji not found');
    }
    process.exit();
}
verify();
