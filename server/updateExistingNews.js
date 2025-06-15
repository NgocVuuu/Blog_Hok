const mongoose = require('mongoose');
const News = require('./models/News');
require('dotenv').config();

const updateExistingNews = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all existing news that don't have category or author
    const result = await News.updateMany(
      {
        $or: [
          { category: { $exists: false } },
          { author: { $exists: false } },
          { slug: { $exists: false } }
        ]
      },
      {
        $set: {
          category: 'guides',
          author: 'BlogHok'
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} news articles`);

    // Generate slugs for ALL existing news
    const allNews = await News.find({});
    console.log(`Found ${allNews.length} news articles to process`);

    for (const news of allNews) {
      // Force regeneration of slug by marking title as modified
      news.markModified('title');
      await news.save(); // This will trigger the pre-save middleware to generate slug
      console.log(`Generated slug "${news.slug}" for: ${news.title}`);
    }

    console.log('Update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating news:', error);
    process.exit(1);
  }
};

updateExistingNews();
