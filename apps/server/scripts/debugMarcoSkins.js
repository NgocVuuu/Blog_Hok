const path = require('path');
const dotenv = require('dotenv');
const serverEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serverEnvPath });

const { connectDB } = require('../config/db');
const Hero = require('../models/Hero');

async function run() {
    await connectDB();
    const hero = await Hero.findOne({ name: 'Marco Polo' });
    if (!hero) {
        console.log('Marco Polo not found in DB');
    } else {
        console.log('Marco Polo Skins in DB:', JSON.stringify(hero.skins, null, 2));
    }
    process.exit(0);
}

run();
