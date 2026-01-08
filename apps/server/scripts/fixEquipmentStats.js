const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('../models/Equipment');

const STAT_MAP = {
    'Physical Attack': 'attack',
    'Attack': 'attack',
    'Magic Power': 'magic',
    'Physical Defense': 'defense',
    'Defense': 'defense',
    'Magic Defense': 'magicResist',
    'Max Health': 'health',
    'Max Mana': 'mana',
    'Cooldown Reduction': 'cooldownReduction',
    'Movement Speed': 'movementSpeed',
    'Attack Speed': 'attackSpeed',
    'Critical Rate': 'criticalRate',
    'Lifesteal': 'lifeSteal',
    'Magic Lifesteal': 'magicLifeSteal',
    'Physical Penetration': 'penetration',
    'Magic Penetration': 'magicPenetration'
};

async function fixStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const items = await Equipment.find({});
        console.log(`Processing ${items.length} items...`);

        let updatedCount = 0;

        for (const item of items) {
            if (item.quickStats && item.quickStats.length > 0) {
                let hasUpdates = false;

                for (const stat of item.quickStats) {
                    const label = stat.label || stat.type;
                    const valStr = stat.value; // e.g., "+60" or "+10%"

                    // Clean value
                    let val = 0;
                    if (typeof valStr === 'string') {
                        val = parseFloat(valStr.replace(/[^0-9.-]/g, ''));
                    } else if (typeof valStr === 'number') {
                        val = valStr;
                    }

                    // Map to attribute key
                    let attrKey = STAT_MAP[label];

                    if (!attrKey) {
                        // Try flexible matching
                        const lowerLabel = label.toLowerCase();

                        if (lowerLabel.includes('attack') && !lowerLabel.includes('speed')) attrKey = 'attack';
                        else if (lowerLabel.includes('magic') && !lowerLabel.includes('defense') && !lowerLabel.includes('lifesteal') && !lowerLabel.includes('penetration')) attrKey = 'magic';
                        else if (lowerLabel.includes('health')) attrKey = 'health';
                        else if (lowerLabel.includes('mana')) attrKey = 'mana';
                        else if ((lowerLabel.includes('defense') || lowerLabel.includes('armor')) && !lowerLabel.includes('magic')) attrKey = 'defense';

                        else if (lowerLabel.includes('movement') && lowerLabel.includes('speed')) attrKey = 'movementSpeed';
                        else if (lowerLabel.includes('attack') && lowerLabel.includes('speed')) attrKey = 'attackSpeed';

                        else if (lowerLabel.includes('critical') && lowerLabel.includes('rate')) attrKey = 'criticalRate';
                        else if (lowerLabel.includes('critical') && lowerLabel.includes('damage')) attrKey = 'criticalDamage';

                        else if (lowerLabel.includes('lifesteal') && !lowerLabel.includes('magic')) attrKey = 'lifeSteal';
                        else if (lowerLabel.includes('magic') && lowerLabel.includes('lifesteal')) attrKey = 'magicLifeSteal';

                        else if (lowerLabel.includes('cooldown')) attrKey = 'cooldownReduction';

                        else if (lowerLabel.includes('penetration') && !lowerLabel.includes('magic')) attrKey = 'penetration';
                        else if (lowerLabel.includes('magic') && lowerLabel.includes('penetration')) attrKey = 'magicPenetration';
                    }

                    if (attrKey && val) {
                        // Update attribute
                        if (item.attributes[attrKey] !== val) {
                            item.attributes[attrKey] = val;
                            hasUpdates = true;
                        }
                    } else {
                        console.log(`[WARN] Could not map label: "${label}" (item: ${item.name})`);
                    }
                }

                if (hasUpdates) {
                    await item.save();
                    updatedCount++;
                    console.log(`Updated ${item.name}`);
                }
            }
        }

        console.log(`Finished. Updated ${updatedCount} items.`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixStats();
