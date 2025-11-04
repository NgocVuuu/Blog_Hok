// Load environment variables first
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const Equipment = require('../models/Equipment');
const Arcana = require('../models/Arcana');
const News = require('../models/News');

const seedHeroes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Hero.deleteMany({});
    await Equipment.deleteMany({});
    await Arcana.deleteMany({});
    await News.deleteMany({});
    console.log('Cleared existing data');

    // Seed Heroes
    const heroes = [
      {
        name: 'Yorn',
        title: 'Thần Bắn Tỉa',
        image: 'https://img.gamehub.vn/2024/01/15/yorn-1705308956-1.jpg',
        role: 'Marksman',
        lanes: ['Abyssal Dragon Lane'],
        difficulty: 2,
        description: 'Xạ thủ tầm xa với sát thương ổn định',
        lore: 'Yorn là một chiến binh từ vùng đất xa xôi...',
        skills: [
          {
            name: 'Passive: Eagle Eye',
            description: 'Tăng tầm đánh khi đứng yên',
            image: 'https://example.com/yorn-passive.jpg'
          },
          {
            name: 'Q: Explosive Arrow',
            description: 'Bắn mũi tên nổ gây sát thương vùng',
            image: 'https://example.com/yorn-q.jpg'
          }
        ],
        stats: {
          health: 3307,
          mana: 1700,
          armor: 168,
          magicResist: 80,
          attackDamage: 171
        },
        skins: [
          {
            name: 'Default',
            image: 'https://img.gamehub.vn/2024/01/15/yorn-1705308956-1.jpg'
          }
        ],
        allies: ['Arthur', 'Grakk'],
        counters: ['Butterfly', 'Nakroth'],
        slug: 'yorn'
      },
      {
        name: 'Arthur',
        title: 'Hiệp Sĩ Bất Tử',
        image: 'https://img.gamehub.vn/2024/01/15/arthur-1705308956-2.jpg',
        role: 'Tank',
        lanes: ['Dark Slayer Lane'],
        difficulty: 1,
        description: 'Đỡ đòn mạnh mẽ với khả năng hồi phục',
        lore: 'Arthur là một hiệp sĩ cao quý...',
        skills: [
          {
            name: 'Passive: Holy Guard',
            description: 'Hồi máu khi máu thấp',
            image: 'https://example.com/arthur-passive.jpg'
          },
          {
            name: 'Q: Divine Sword',
            description: 'Đánh 3 nhát liên tiếp',
            image: 'https://example.com/arthur-q.jpg'
          }
        ],
        stats: {
          health: 3500,
          mana: 1500,
          armor: 200,
          magicResist: 120,
          attackDamage: 150
        },
        skins: [
          {
            name: 'Default',
            image: 'https://img.gamehub.vn/2024/01/15/arthur-1705308956-2.jpg'
          }
        ],
        allies: ['Yorn', 'Alice'],
        counters: ['Liliana', 'Raz'],
        slug: 'arthur'
      }
    ];

    await Hero.insertMany(heroes);
    console.log('Heroes seeded successfully');

    // Seed Equipment
    const equipment = [
      {
        name: 'Claves Sancti',
        image: 'https://example.com/claves-sancti.jpg',
        description: 'Tăng sát thương chí mạng',
        category: 'Physical',
        price: 2020,
        stats: {
          'Physical Attack': 90,
          'Critical Chance': 25
        },
        passive: {
          name: 'Sanctified',
          description: 'Tăng 30% sát thương chí mạng'
        }
      },
      {
        name: 'Aegis',
        image: 'https://example.com/aegis.jpg',
        description: 'Giáp phép thuật mạnh mẽ',
        category: 'Defense',
        price: 1950,
        stats: {
          'Magic Defense': 360,
          'Health': 1200
        },
        passive: {
          name: 'Magic Shield',
          description: 'Hấp thụ sát thương phép thuật'
        }
      }
    ];

    await Equipment.insertMany(equipment);
    console.log('Equipment seeded successfully');

    // Seed News
    const news = [
      {
        title: 'Cập Nhật Mùa Mới',
        content: 'Nhiều tướng mới và cân bằng gameplay',
        excerpt: 'Khám phá những thay đổi lớn trong phiên bản mới',
        image: 'https://example.com/news1.jpg',
        category: 'updates',
        author: 'Admin',
        publishedAt: new Date(),
        slug: 'cap-nhat-mua-moi'
      },
      {
        title: 'Hướng Dẫn Chơi Yorn',
        content: 'Cách build và chơi Yorn hiệu quả',
        excerpt: 'Tìm hiểu cách tối ưu hóa Yorn trong rank',
        image: 'https://example.com/news2.jpg',
        category: 'guides',
        author: 'Admin',
        publishedAt: new Date(),
        slug: 'huong-dan-choi-yorn'
      }
    ];

    await News.insertMany(news);
    console.log('News seeded successfully');

    console.log('All data seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedHeroes();
