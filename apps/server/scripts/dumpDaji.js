const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const hero = await Hero.findOne({ name: 'Daji' }).lean();

        console.log('Hero:', hero.name);
        console.log('suggestedEquipment Length:', hero.suggestedEquipment ? hero.suggestedEquipment.length : 0);
        console.log('suggestedEquipment Sample:', JSON.stringify(hero.suggestedEquipment.slice(0, 3), null, 2));

        console.log('itemBuilds Length:', hero.itemBuilds ? hero.itemBuilds.length : 0);
        console.log('itemBuilds Sample:', JSON.stringify(hero.itemBuilds, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
