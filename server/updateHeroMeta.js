const mongoose = require('mongoose');
const Hero = require('./models/Hero');
require('dotenv').config();

const updateHeroMeta = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all heroes
    const heroes = await Hero.find();
    console.log(`Found ${heroes.length} heroes to update`);

    // Sample meta data
    const metaTiers = ['S', 'A', 'B', 'C'];
    const sampleWinRates = [45, 48, 52, 55, 58, 62, 65];
    const samplePickRates = [5, 8, 12, 15, 18, 22, 25];
    const sampleBanRates = [2, 5, 8, 12, 15, 18, 20];

    // Update each hero with meta information
    for (const hero of heroes) {
      const randomTier = metaTiers[Math.floor(Math.random() * metaTiers.length)];
      const randomWinRate = sampleWinRates[Math.floor(Math.random() * sampleWinRates.length)];
      const randomPickRate = samplePickRates[Math.floor(Math.random() * samplePickRates.length)];
      const randomBanRate = sampleBanRates[Math.floor(Math.random() * sampleBanRates.length)];

      await Hero.findByIdAndUpdate(hero._id, {
        metaTier: randomTier,
        winRate: randomWinRate,
        pickRate: randomPickRate,
        banRate: randomBanRate
      });

      console.log(`Updated ${hero.name}: ${randomTier} tier, ${randomWinRate}% WR, ${randomPickRate}% PR, ${randomBanRate}% BR`);
    }

    console.log('Hero meta update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating hero meta:', error);
    process.exit(1);
  }
};

updateHeroMeta();
