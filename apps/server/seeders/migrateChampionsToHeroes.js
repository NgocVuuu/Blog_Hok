const mongoose = require('mongoose');
const { mongoURI } = require('../config/db');
const Champion = require('../models/Champion');
const Hero = require('../models/Hero');

const migrateData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all champions
    const champions = await Champion.find({});
    console.log(`Found ${champions.length} champions to migrate`);

    // Create a map to store old ID to new ID mapping
    const idMap = new Map();

    // First pass: Create all heroes and store ID mappings
    for (const champion of champions) {
      const heroData = champion.toObject();
      const oldId = heroData._id;
      delete heroData._id; // Remove the old _id
      
      const hero = new Hero(heroData);
      await hero.save();
      idMap.set(oldId.toString(), hero._id);
      console.log(`Created hero ${hero.name}`);
    }

    // Second pass: Update references
    for (const champion of champions) {
      const hero = await Hero.findOne({ name: champion.name });
      if (!hero) continue;

      // Update allies references
      if (champion.allies && champion.allies.length > 0) {
        hero.allies = champion.allies.map(id => idMap.get(id.toString()));
      }

      // Update counters references
      if (champion.counters && champion.counters.length > 0) {
        hero.counters = champion.counters.map(id => idMap.get(id.toString()));
      }

      await hero.save();
      console.log(`Updated references for ${hero.name}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateData(); 