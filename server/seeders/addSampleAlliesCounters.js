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
    // Lấy danh sách các hero khác
    const others = heroes.filter(h => !h._id.equals(hero._id));
    if (others.length === 0) continue;
    // Chọn ally và counter ngẫu nhiên
    const ally = others[Math.floor(Math.random() * others.length)];
    let counter = others[Math.floor(Math.random() * others.length)];
    // Đảm bảo ally và counter khác nhau
    while (counter._id.equals(ally._id) && others.length > 1) {
      counter = others[Math.floor(Math.random() * others.length)];
    }
    await db.collection('heroes').updateOne(
      { _id: hero._id },
      {
        $set: {
          allies: [{ hero: ally._id, description: `Đồng minh mẫu với ${ally.name}` }],
          counters: [{ hero: counter._id, description: `Khắc chế mẫu bởi ${counter.name}` }]
        }
      }
    );
    count++;
    console.log(`Updated hero: ${hero.name} (Ally: ${ally.name}, Counter: ${counter.name})`);
  }
  console.log(`Done. Updated ${count} heroes.`);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); }); 