const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find heroes with image containing 'fandom.com' or 'wikia'
        const filter = {
            image: { $regex: /fandom\.com|wikia/, $options: 'i' }
        };

        const badHeroes = await Hero.find(filter);
        console.log(`Found ${badHeroes.length} heroes with Wiki/Fandom avatars.`);

        if (badHeroes.length > 0) {
            const res = await Hero.updateMany(filter, { $set: { image: '' } });
            console.log(`Cleared avatars for ${res.modifiedCount} heroes.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
