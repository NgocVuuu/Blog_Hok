// Load environment variables first
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { mongoURI } = require('../config/db');

const checkCollections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check each collection for potential champion/hero data
    for (const collection of collections) {
      const coll = mongoose.connection.db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`\n${collection.name} collection has ${count} documents`);

      if (count > 0) {
        const sampleDoc = await coll.findOne();
        console.log(`\nSample document from ${collection.name}:`);
        console.log(JSON.stringify(sampleDoc, null, 2));

        // Check if this collection might contain champion/hero data
        const docKeys = Object.keys(sampleDoc);
        if (docKeys.includes('name') && 
            (docKeys.includes('roles') || docKeys.includes('skills') || docKeys.includes('lanes'))) {
          console.log(`\nWARNING: ${collection.name} might contain champion/hero data!`);
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCollections(); 