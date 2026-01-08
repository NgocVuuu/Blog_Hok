const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find heroes with bannerImage NOT empty AND NOT containing 'camp.honorofkings.com'
        const filter = {
            bannerImage: { $nin: ['', null], $not: /camp\.honorofkings\.com/ }
        };

        const badHeroes = await Hero.find(filter);
        console.log(`Found ${badHeroes.length} heroes with invalid banners.`);

        if (badHeroes.length > 0) {
            const res = await Hero.updateMany(filter, { $set: { bannerImage: '' } });
            console.log(`Cleared banners for ${res.modifiedCount} heroes.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
