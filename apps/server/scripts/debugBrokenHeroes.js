const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const names = ['Chicha', 'Gao', 'Alessio'];

        for (const n of names) {
            const h = await Hero.findOne({ name: { $regex: new RegExp(`^${n}$`, 'i') } });
            if (h) {
                console.log(`\n=== ${h.name} ===`);
                console.log(`ID: ${h._id}`);
                console.log(`Lore: ${h.lore ? h.lore.substring(0, 50) + '...' : 'MISSING'}`);
                console.log(`Skins: ${h.skins.length} items`);
                if (h.skins.length > 0) {
                    console.log(`Skin Details: ${h.skins.map(s => s.name).join(', ')}`);
                }
            } else {
                console.log(`\n=== ${n} NOT FOUND ===`);
            }
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
})();
