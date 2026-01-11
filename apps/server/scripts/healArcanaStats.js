const mongoose = require('mongoose');
const Arcana = require('../models/Arcana');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const STAT_MAPPINGS = [
    { regex: /Physical Attack\s*\+([\d\.]+)/i, key: 'attack' },
    { regex: /Magical Attack\s*\+([\d\.]+)/i, key: 'magic' }, // or magicPower
    { regex: /Max HP\s*\+([\d\.]+)/i, key: 'health' },
    { regex: /Max Health\s*\+([\d\.]+)/i, key: 'health' },
    { regex: /Max Mana\s*\+([\d\.]+)/i, key: 'mana' },
    { regex: /Physical Defense\s*\+([\d\.]+)/i, key: 'defense' }, // or physicalDefense
    { regex: /Magical Defense\s*\+([\d\.]+)/i, key: 'magicDefense' },
    { regex: /Attack Speed\s*\+([\d\.]+)%/i, key: 'attackSpeed' },
    { regex: /Crit Rate\s*\+([\d\.]+)%/i, key: 'criticalRate' },
    { regex: /Critical Rate\s*\+([\d\.]+)%/i, key: 'criticalRate' },
    { regex: /Crit Damage\s*\+([\d\.]+)%/i, key: 'criticalDamage' },
    { regex: /Critical Damage\s*\+([\d\.]+)%/i, key: 'criticalDamage' },
    { regex: /Physical Penis\s*\+([\d\.]+)/i, key: 'penetration' }, // Just kidding, checking regex
    { regex: /Physical Pierce\s*\+([\d\.]+)/i, key: 'penetration' },
    { regex: /Magical Pierce\s*\+([\d\.]+)/i, key: 'magicPenetration' },
    { regex: /Magical Lifesteal\s*\+([\d\.]+)%/i, key: 'magicLifeSteal' },
    { regex: /Physical Lifesteal\s*\+([\d\.]+)%/i, key: 'lifeSteal' },
    { regex: /Movement Speed\s*\+([\d\.]+)%/i, key: 'movementSpeed' },
    { regex: /Cooldown Reduction\s*\+([\d\.]+)%/i, key: 'cooldownReduction' },
    { regex: /Health Per 5s\s*\+([\d\.]+)/i, key: 'hpRegen' }, // extra
];

async function heal() {
    if (!process.env.MONGODB_URI) throw new Error('No Mongo URI');
    await mongoose.connect(process.env.MONGODB_URI);

    const arcanas = await Arcana.find({});
    console.log(`Found ${arcanas.length} arcanas.`);

    for (const a of arcanas) {
        if (!a.description) continue;

        let updated = false;
        // Parse description
        const lines = a.description.split('\n');
        const newStats = { ...a.attributes }; // keep existing structure

        // Reset to 0 first if we are doing full re-parse?
        // Better to overwrite found keys.

        // Combine lines for safety
        const fullDesc = a.description.replace(/\n/g, ', ');

        for (const map of STAT_MAPPINGS) {
            const match = fullDesc.match(map.regex);
            if (match) {
                const val = parseFloat(match[1]);
                if (!isNaN(val)) {
                    // Check if different
                    if (newStats[map.key] !== val) {
                        newStats[map.key] = val;
                        updated = true;
                        console.log(`[${a.name}] Parsed ${map.key}: ${val}`);
                    }
                }
            }
        }

        if (updated) {
            a.attributes = newStats;
            await a.save();
        }
    }

    console.log('Heal complete.');
    await mongoose.connection.close();
}

heal().catch(console.error);
