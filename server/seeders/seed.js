const mongoose = require('mongoose');
const dotenv = require('dotenv');
const seedData = require('./seedData');

dotenv.config();

// Validate MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  return seedData();
})
.then(() => {
  console.log('Seeding completed');
  process.exit(0);
})
.catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
}); 