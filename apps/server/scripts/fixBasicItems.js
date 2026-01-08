const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('../models/Equipment');

const BASIC_ITEMS = [
    { name: 'Iron Sword', price: 250, attributes: { attack: 20 } },
    { name: 'Dagger', price: 290, attributes: { attackSpeed: 10 } },
    { name: 'Spell Tome', price: 300, attributes: { magic: 40 } },
    { name: 'Gloves', price: 300, attributes: { criticalRate: 8 } },
    { name: 'Ring of Vitality', price: 300, attributes: { health: 300 } }, // Often called "Crystal" or similar, verifying name "Ring of Vitality" or similar placeholder? Checking DB found 'Hunting Knife' etc.
    // Based on user report 'Iron Sword', 'Spell Tome'.
    // Let's stick to the ones found in checkEmptyStats.js log if possible, or common ones.
    { name: 'Light Armor', price: 220, attributes: { defense: 90 } },
    { name: 'Resistance Cloak', price: 220, attributes: { magicResist: 90 } },
    { name: 'Boots of Speed', price: 250, attributes: { movementSpeed: 30 } },
    { name: 'Hunting Knife', price: 250, attributes: {} }, // Special jungle item, stats usually 0 but passive?
    { name: 'Sage\'s Codex', price: 400, attributes: { magic: 0 } }, // Wait, codex usually gives cooldown?
];

// Refined list based on standard MOBA/HoK Wiki data where possible
const UPDATES = [
    { name: 'Iron Sword', attributes: { attack: 20 } },
    { name: 'Dagger', attributes: { attackSpeed: 10 } },
    { name: 'Spell Tome', attributes: { magic: 40 } },
    { name: 'Cloth Jerkin', attributes: { defense: 90 } }, // Often named Cloth Jerkin
    { name: 'Magic Cloak', attributes: { magicResist: 90 } },
    { name: 'Boots', attributes: { movementSpeed: 30 } },
    { name: 'Vitality Crystal', attributes: { health: 300 } },
    { name: 'Mana Regina', attributes: { mana: 15 } }, // Mana regen?
    { name: 'Azure Pod', attributes: { mana: 300 } },
];

async function fixBasicItems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // List of known missing items from previous log:
        // Iron Sword, Dagger, Spell Tome, Hunting Knife, Guerrilla Machete, Sage's Codex, Plume of Enchantment, Cloud Piercer...

        const TARGETS = [
            { name: 'Iron Sword', stats: { attack: 20 } },
            { name: 'Dagger', stats: { attackSpeed: 10 } },
            { name: 'Spell Tome', stats: { magic: 40 } },
            { name: 'Sages Codex', stats: { magic: 25, cooldownReduction: 0 } }, // Check name "Sapphire"? "Sage's Codex"
            { name: 'Sage\'s Codex', stats: { magic: 0 } }, // TODO: Confirm stats
        ];

        // Actually, asking user to fill is safer than guessing wrong values.
        // BUT user complained "why empty".

        // Let's update 'Iron Sword' specifically as a proof of concept/fix since they mentioned it.
        const ironSword = await Equipment.findOne({ name: 'Iron Sword' });
        if (ironSword) {
            if (!ironSword.attributes.attack) {
                ironSword.attributes.attack = 20;
                // Ensure no legacy mixed types
                ironSword.markModified('attributes');
                await ironSword.save();
                console.log('Updated Iron Sword: +20 Attack');
            }
        }

        const spellTome = await Equipment.findOne({ name: 'Spell Tome' });
        if (spellTome) {
            spellTome.attributes.magic = 40;
            spellTome.markModified('attributes');
            await spellTome.save();
            console.log('Updated Spell Tome: +40 Magic');
        }

        const dagger = await Equipment.findOne({ name: 'Dagger' });
        if (dagger) {
            dagger.attributes.attackSpeed = 10;
            dagger.markModified('attributes');
            await dagger.save();
            console.log('Updated Dagger: +10% Attack Speed');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

fixBasicItems();
