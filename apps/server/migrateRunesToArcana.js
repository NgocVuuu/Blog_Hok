const mongoose = require('mongoose');
const Rune = require('./models/Rune');
const Arcana = require('./models/Arcana');
require('dotenv').config();

const migrateRunesToArcana = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all runes
    const runes = await Rune.find();
    console.log(`Found ${runes.length} runes to migrate`);

    // Map rune branches to arcana colors
    const branchToColorMap = {
      'Domination': 'red',
      'Precision': 'blue', 
      'Sorcery': 'green',
      'Resolve': 'red',
      'Inspiration': 'blue'
    };

    // Convert runes to arcana
    for (const rune of runes) {
      const arcanaData = {
        name: rune.name,
        color: branchToColorMap[rune.branch] || 'red',
        tier: Math.floor(Math.random() * 3) + 1, // Random tier 1-3
        image: rune.image,
        description: rune.description,
        attributes: {
          attack: Math.floor(Math.random() * 20),
          defense: Math.floor(Math.random() * 15),
          magic: Math.floor(Math.random() * 25),
          health: Math.floor(Math.random() * 100),
          mana: Math.floor(Math.random() * 50),
          speed: Math.floor(Math.random() * 10),
          criticalRate: Math.floor(Math.random() * 5),
          criticalDamage: Math.floor(Math.random() * 10),
          penetration: Math.floor(Math.random() * 15),
          magicPenetration: Math.floor(Math.random() * 15),
          lifeSteal: Math.floor(Math.random() * 8),
          magicLifeSteal: Math.floor(Math.random() * 8),
          cooldownReduction: Math.floor(Math.random() * 10),
          attackSpeed: Math.floor(Math.random() * 15),
          movementSpeed: Math.floor(Math.random() * 5)
        },
        effects: rune.effects || [],
        usage: rune.usage,
        recommendedFor: ['Marksman', 'Mage', 'Tank', 'Support', 'Assassin', 'Fighter'].slice(0, Math.floor(Math.random() * 3) + 1)
      };

      // Check if arcana already exists
      const existingArcana = await Arcana.findOne({ name: arcanaData.name });
      if (!existingArcana) {
        const newArcana = new Arcana(arcanaData);
        await newArcana.save();
        console.log(`Migrated rune "${rune.name}" to arcana`);
      } else {
        console.log(`Arcana "${arcanaData.name}" already exists, skipping`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

migrateRunesToArcana();
