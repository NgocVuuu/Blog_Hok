const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Champion = require('../models/Champion');
const Item = require('../models/Item');
const Rune = require('../models/Rune');
const Meta = require('../models/Meta');
const News = require('../models/News');

const seedData = async () => {
  try {
    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });
    await admin.save();
    console.log('Admin user seeded');

    // Seed champions
    const champions = [
      {
        name: 'Ahri',
        title: 'Hồ Ly Chín Đuôi',
        image: 'https://example.com/ahri.jpg',
        role: 'Mage',
        difficulty: 3,
        description: 'Tướng phép thuật sát thương cao',
        abilities: ['Q: Orb of Deception', 'W: Fox-Fire', 'E: Charm', 'R: Spirit Rush'],
        stats: { health: 590, mana: 418, armor: 20, magicResist: 30 },
        recommendedItems: [],
        recommendedRunes: [],
      },
      {
        name: 'Yasuo',
        title: 'Kiếm Khách Vô Danh',
        image: 'https://example.com/yasuo.jpg',
        role: 'Fighter',
        difficulty: 4,
        description: 'Tướng cận chiến sát thương cao',
        abilities: ['Q: Steel Tempest', 'W: Wind Wall', 'E: Sweeping Blade', 'R: Last Breath'],
        stats: { health: 490, mana: 100, armor: 30, magicResist: 30 },
        recommendedItems: [],
        recommendedRunes: [],
      },
    ];
    await Champion.insertMany(champions);
    console.log('Champions seeded');

    // Seed items
    const items = [
      {
        name: 'Infinity Edge',
        image: 'https://example.com/infinity-edge.jpg',
        description: 'Tăng sát thương chí mạng',
        type: 'Attack',
        stats: { attackDamage: 70, criticalStrike: 20 },
      },
      {
        name: 'Zhonya\'s Hourglass',
        image: 'https://example.com/zhonyas.jpg',
        description: 'Vô hiệu hóa trong 2.5 giây',
        type: 'Magic',
        stats: { abilityPower: 75, armor: 45 },
      },
    ];
    await Item.insertMany(items);
    console.log('Items seeded');

    // Seed runes
    const runes = [
      {
        name: 'Conqueror',
        branch: 'Precision',
        image: 'https://example.com/conqueror.jpg',
        description: 'Tăng sát thương theo thời gian',
        effects: ['Tăng 2-6 sát thương', 'Hồi máu 15% sát thương gây ra'],
        usage: 'Dùng cho tướng cận chiến',
      },
      {
        name: 'Electrocute',
        branch: 'Domination',
        image: 'https://example.com/electrocute.jpg',
        description: 'Gây sát thương sau 3 đòn đánh',
        effects: ['Gây 30-180 sát thương'],
        usage: 'Dùng cho tướng sát thương nổ',
      },
    ];
    await Rune.insertMany(runes);
    console.log('Runes seeded');

    // Seed meta
    const meta = new Meta({
      champions: [], // TODO: Thêm ID tướng mạnh
      reason: 'Meta hiện tại ưu tiên tướng sát thương nổ',
    });
    await meta.save();
    console.log('Meta seeded');

    // Seed news
    const news = [
      {
        title: 'Cập Nhật 10.1',
        content: 'Nhiều thay đổi lớn về cân bằng tướng',
        image: 'https://example.com/patch-10.1.jpg',
        publishedAt: new Date(),
      },
      {
        title: 'Sự Kiện Mùa Hè',
        content: 'Sự kiện đặc biệt với nhiều phần thưởng hấp dẫn',
        image: 'https://example.com/summer-event.jpg',
        publishedAt: new Date(),
      },
    ];
    await News.insertMany(news);
    console.log('News seeded');

    console.log('All data seeded successfully');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

module.exports = seedData; 