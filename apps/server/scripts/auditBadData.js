const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const targets = ['Hou Yi', 'Lady Sun', 'Angela', 'Daji', 'Arthur', 'Chicha'];
        const heroes = await Hero.find({ name: { $in: targets } }).lean();

        heroes.forEach(h => {
            console.log(`\n--- ${h.name} ---`);
            console.log('Title:', h.title);
            console.log('Roles:', h.roles);
            console.log('Class:', h.class); // Check if class and roles are consistent
            console.log('Lanes:', h.lanes);
            console.log('Slug:', h.slug);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
