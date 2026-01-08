const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const hero = await Hero.findOne({ name: 'Angela' });
        console.log('Hero:', hero.name);
        console.log('Image:', hero.image);
        console.log('Banner:', hero.bannerImage);

        if (hero.image && hero.image.includes('res.cloudinary.com')) {
            console.log('SUCCESS: Avatar is hosted on Cloudinary.');
        } else {
            console.log('FAIL: Avatar is NOT on Cloudinary.');
        }

        if (hero.bannerImage && hero.bannerImage.includes('res.cloudinary.com')) {
            console.log('SUCCESS: Banner is hosted on Cloudinary.');
        } else if (!hero.bannerImage) {
            console.log('INFO: Banner is empty (acceptable).'); // acceptable if strictly official and none found
        } else {
            console.log('FAIL: Banner is NOT on Cloudinary.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
