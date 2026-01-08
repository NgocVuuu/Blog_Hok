const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const hero = await Hero.findOne({ name: 'Angela' }).lean();
        if (!hero) {
            console.log('Angela not found');
        } else {
            console.log('Current Banner:', hero.bannerImage);
            console.log('Current Avatar:', hero.image);
            console.log('ID:', hero._id);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
