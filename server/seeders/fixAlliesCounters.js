const mongoose = require('mongoose');
const { mongoURI } = require('../config/db');

const run = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection.db;
  const heroes = await db.collection('heroes').find({}).toArray();
  let count = 0;
  for (const hero of heroes) {
    let changed = false;
    let newAllies = hero.allies;
    let newCounters = hero.counters;
    if (Array.isArray(hero.allies) && hero.allies.length > 0 && typeof hero.allies[0] !== 'object') {
      newAllies = hero.allies.map(id => ({ hero: id, description: '' }));
      changed = true;
    }
    if (Array.isArray(hero.counters) && hero.counters.length > 0 && typeof hero.counters[0] !== 'object') {
      newCounters = hero.counters.map(id => ({ hero: id, description: '' }));
      changed = true;
    }
    if (changed) {
      await db.collection('heroes').updateOne(
        { _id: hero._id },
        { $set: { allies: newAllies, counters: newCounters } }
      );
      count++;
      console.log(`Updated hero: ${hero.name}`);
    }
  }
  console.log(`Done. Updated ${count} heroes.`);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); }); 