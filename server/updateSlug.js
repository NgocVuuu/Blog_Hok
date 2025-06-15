const mongoose = require('mongoose');
const config = require('./config/db');
const Hero = require('./models/Hero');

const updateSlugs = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const heroes = await Hero.find({});
    console.log(`Found ${heroes.length} heroes to update`);

    for (const hero of heroes) {
      hero.slug = hero.name.toLowerCase().replace(/\s+/g, '-');
      await hero.save();
      console.log(`Updated slug for ${hero.name}`);
    }

    console.log('All slugs updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  }
};

updateSlugs(); 