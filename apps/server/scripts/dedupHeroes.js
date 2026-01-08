const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const heroes = await Hero.find({}, 'name _id').lean();
        const map = {};
        const angela = await Hero.findOne({ name: 'Angela' });
        if (angela) {
            console.log('Deleting Angela:', angela._id);
            await Hero.deleteOne({ _id: angela._id });
        }
        console.log('Dedup complete.');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
