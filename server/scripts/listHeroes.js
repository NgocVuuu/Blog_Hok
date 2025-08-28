// Load env
const path = require('path');
const dotenv = require('dotenv');
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
const envLoaded = dotenv.config({ path: serverEnvPath });
if (envLoaded.error) dotenv.config({ path: rootEnvPath });

const { connectDB } = require('../config/db');
const Hero = require('../models/Hero');

(async () => {
  try {
    await connectDB();
    const heroes = await Hero.find({}, { name: 1, slug: 1, roles: 1 }).sort({ name: 1 }).lean();
    console.log(JSON.stringify(heroes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('List heroes error:', err.message || err);
    process.exit(1);
  }
})();
