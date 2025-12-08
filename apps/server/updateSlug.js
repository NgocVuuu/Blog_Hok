const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
// Load env from server/.env then fallback to repo root .env
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');
const envLoaded = dotenv.config({ path: serverEnvPath });
if (envLoaded.error) {
  dotenv.config({ path: rootEnvPath });
}
const config = require('./config/db');
const Hero = require('./models/Hero');

function slugify(input) {
  if (!input) return '';
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const updateSlugs = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const heroes = await Hero.find({});
    console.log(`Found ${heroes.length} heroes to update`);

    const used = new Set();
    for (const hero of heroes) {
      let base = slugify(hero.name);
      let candidate = base;
      let i = 2;
      // Ensure uniqueness across this run to avoid duplicate key errors
      while (used.has(candidate)) {
        candidate = `${base}-${i++}`;
      }
      hero.slug = candidate;
      await hero.save();
      used.add(candidate);
      console.log(`Updated slug for ${hero.name} -> ${candidate}`);
    }

    console.log('All slugs updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  }
};

updateSlugs(); 