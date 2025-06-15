const mongoose = require('mongoose');
const Item = require('./models/Item');
const Arcana = require('./models/Arcana');
require('dotenv').config();

const seedSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Sample Items
    const sampleItems = [
      {
        name: 'Blade of Eternity',
        image: 'https://via.placeholder.com/150x150?text=Blade',
        description: 'A legendary sword that grants immense power to its wielder.',
        category: 'Attack',
        tier: 'Legendary',
        price: 2100,
        attributes: {
          attack: 60,
          health: 1000,
          lifeSteal: 10
        },
        passive: {
          name: 'Immortal',
          description: 'When HP drops to 0, revive with 2s immunity and 15% HP. 180s cooldown.'
        },
        recommendedFor: ['Fighter', 'Assassin'],
        tags: ['Physical', 'Sustain', 'Survival']
      },
      {
        name: 'Staff of Nuul',
        image: 'https://via.placeholder.com/150x150?text=Staff',
        description: 'A powerful staff that pierces through magical defenses.',
        category: 'Magic',
        tier: 'Epic',
        price: 2020,
        attributes: {
          magic: 140,
          magicPenetration: 45,
          cooldownReduction: 10
        },
        passive: {
          name: 'Void',
          description: 'Increases magic penetration by 45% when target has more than 1600 magic defense.'
        },
        recommendedFor: ['Mage'],
        tags: ['Magic', 'Penetration']
      },
      {
        name: 'Medallion of Troy',
        image: 'https://via.placeholder.com/150x150?text=Medallion',
        description: 'Ancient medallion that provides magical protection.',
        category: 'Defense',
        tier: 'Epic',
        price: 2180,
        attributes: {
          health: 1200,
          magicResist: 360,
          cooldownReduction: 20
        },
        passive: {
          name: 'Sanctuary',
          description: 'Reduces magic damage taken by 15%.'
        },
        recommendedFor: ['Tank', 'Support'],
        tags: ['Magic Defense', 'Health']
      },
      {
        name: 'Sonic Boots',
        image: 'https://via.placeholder.com/150x150?text=Boots',
        description: 'Swift boots that enhance movement speed.',
        category: 'Boots',
        tier: 'Advanced',
        price: 710,
        attributes: {
          movementSpeed: 60,
          magicResist: 110
        },
        recommendedFor: ['All'],
        tags: ['Movement', 'Magic Defense']
      }
    ];

    // Sample Arcana
    const sampleArcana = [
      {
        name: 'Onslaught',
        color: 'red',
        tier: 3,
        image: 'https://via.placeholder.com/100x100?text=Onslaught',
        description: 'Increases attack damage and critical rate.',
        attributes: {
          attack: 9,
          criticalRate: 1.6
        },
        effects: ['Increases physical attack by 9', 'Increases critical rate by 1.6%'],
        recommendedFor: ['Marksman', 'Assassin']
      },
      {
        name: 'Guerrilla',
        color: 'red',
        tier: 2,
        image: 'https://via.placeholder.com/100x100?text=Guerrilla',
        description: 'Provides attack damage and armor penetration.',
        attributes: {
          attack: 5,
          penetration: 6.4
        },
        effects: ['Increases physical attack by 5', 'Increases armor penetration by 6.4'],
        recommendedFor: ['Marksman', 'Fighter']
      },
      {
        name: 'Violate',
        color: 'blue',
        tier: 3,
        image: 'https://via.placeholder.com/100x100?text=Violate',
        description: 'Enhances magical power and penetration.',
        attributes: {
          magic: 25,
          magicPenetration: 6.4
        },
        effects: ['Increases magic power by 25', 'Increases magic penetration by 6.4'],
        recommendedFor: ['Mage']
      },
      {
        name: 'Enlightenment',
        color: 'blue',
        tier: 2,
        image: 'https://via.placeholder.com/100x100?text=Enlightenment',
        description: 'Reduces cooldown and increases mana.',
        attributes: {
          mana: 64,
          cooldownReduction: 1
        },
        effects: ['Increases max mana by 64', 'Reduces cooldown by 1%'],
        recommendedFor: ['Mage', 'Support']
      },
      {
        name: 'Indomitable',
        color: 'green',
        tier: 3,
        image: 'https://via.placeholder.com/100x100?text=Indomitable',
        description: 'Provides health and defense.',
        attributes: {
          health: 45,
          defense: 2.3
        },
        effects: ['Increases max HP by 45', 'Increases armor by 2.3'],
        recommendedFor: ['Tank', 'Fighter']
      },
      {
        name: 'Harmony',
        color: 'green',
        tier: 2,
        image: 'https://via.placeholder.com/100x100?text=Harmony',
        description: 'Enhances health and magic resistance.',
        attributes: {
          health: 37.5,
          magicResist: 2.3
        },
        effects: ['Increases max HP by 37.5', 'Increases magic defense by 2.3'],
        recommendedFor: ['Tank', 'Support']
      }
    ];

    // Clear existing data
    await Item.deleteMany({});
    await Arcana.deleteMany({});
    console.log('Cleared existing items and arcana');

    // Insert sample items
    await Item.insertMany(sampleItems);
    console.log(`Inserted ${sampleItems.length} sample items`);

    // Insert sample arcana
    await Arcana.insertMany(sampleArcana);
    console.log(`Inserted ${sampleArcana.length} sample arcana`);

    console.log('Sample data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
};

seedSampleData();
