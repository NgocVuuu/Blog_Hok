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

async function forceSeed() {
    await connectDB();

    const heroName = 'Daji';
    const heroDoc = await Hero.findOne({ name: heroName });

    if (!heroDoc) {
        console.log(`Hero ${heroName} not found`);
        process.exit(1);
    }

    // Real data structure captured from debug session
    const patchNotes = [
        {
            version: "20241128",
            date: new Date("2024-11-28"),
            title: "Reduced skill cooldown and enhanced the range and casting stability of her Ultimate.",
            type: "buff",
            content: `
         <p class="font-bold mb-2 text-lg text-white">Reduced skill cooldown and enhanced the range and casting stability of her Ultimate.</p>
         <ul class="list-none space-y-3">
           <li class="bg-white/5 p-3 rounded-md border border-white/5">
              <div class="font-semibold text-primary mb-1">Heartbreaker</div>
              <div class="text-sm text-gray-300 leading-relaxed">Cooldown: Before: 18s (-3s/lv) -> After: 16s (-2s/lv)</div>
           </li>
           <li class="bg-white/5 p-3 rounded-md border border-white/5">
              <div class="font-semibold text-primary mb-1">Captivate</div>
              <div class="text-sm text-gray-300 leading-relaxed">Range increased, casting animation optimized.</div>
           </li>
         </ul>
       `
        },
        {
            version: "20240901",
            date: new Date("2024-09-01"),
            title: "Damage adjustment for early game.",
            type: "adjust",
            content: `
         <p class="font-bold mb-2 text-lg text-white">Damage adjustment for early game.</p>
         <ul class="list-none space-y-3">
           <li class="bg-white/5 p-3 rounded-md border border-white/5">
              <div class="font-semibold text-primary mb-1">Soul Eater (Skill 1)</div>
              <div class="text-sm text-gray-300 leading-relaxed">Base Damage: 500 (+50/lv) -> 480 (+60/lv)</div>
           </li>
         </ul>
       `
        }
    ];

    heroDoc.patchNotes = patchNotes;
    await heroDoc.save();
    console.log(`Seeded ${patchNotes.length} patch notes for ${heroName}`);
    process.exit();
}

forceSeed();
