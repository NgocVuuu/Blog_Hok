const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Hero = require('../models/Hero');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const heroes = await Hero.find({}).select('name metaTier winRate pickRate banRate lanes roles').lean();

        console.log('Total Heroes:', heroes.length);
        console.log('Sample Stats (Top 20):');
        console.log('Name             | Tier | Win%  | Pick% | Ban%  | Lanes                  | Roles');
        console.log('------------------------------------------------------------------------------------------');

        const top20 = heroes.slice(0, 20);
        top20.forEach(h => {
            const rolesStr = (h.roles || []).join(',');
            const lanesStr = (h.lanes || []).join(',');
            console.log(`${h.name.padEnd(16)} | ${(h.metaTier || '-').padEnd(4)} | ${(h.winRate || 0).toFixed(2).padEnd(5)} | ${(h.pickRate || 0).toFixed(2).padEnd(5)} | ${(h.banRate || 0).toFixed(2).padEnd(5)} | ${lanesStr.padEnd(22)} | ${rolesStr}`);
        });

        // Check for "Low Value" anomalies (e.g. < 1 which suggests 0.53 instead of 53)
        const lowValues = heroes.filter(h => h.winRate > 0 && h.winRate < 1);
        if (lowValues.length > 0) {
            console.log('\n[WARNING] Found heroes with WinRate < 1 (Likely formatting error):');
            lowValues.slice(0, 5).forEach(h => console.log(`${h.name}: ${h.winRate}`));
        } else {
            console.log('\n[OK] No WinRate < 1 found (formatting seems OK).');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
