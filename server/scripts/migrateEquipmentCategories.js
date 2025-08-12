// One-off script to normalize Equipment.category enum values
// Usage: node scripts/migrateEquipmentCategories.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI/MONGODB_URI in env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected');
    const bulk = Equipment.collection.initializeUnorderedBulkOp();
    let ops = 0;

    // Attack -> Physical
    const attackDocs = await Equipment.find({ category: 'Attack' }).select('_id');
    attackDocs.forEach(d => {
      bulk.find({ _id: d._id }).updateOne({ $set: { category: 'Physical' } });
      ops++;
    });

    // Jungling -> Jungle
    const junglingDocs = await Equipment.find({ category: 'Jungling' }).select('_id');
    junglingDocs.forEach(d => {
      bulk.find({ _id: d._id }).updateOne({ $set: { category: 'Jungle' } });
      ops++;
    });

    if (ops > 0) {
      const res = await bulk.execute();
      console.log('Migration result:', res.nModified || res);
    } else {
      console.log('No documents needed changes');
    }
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
