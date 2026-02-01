const mongoose = require('mongoose');
const News = require('../models/News');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const findArticles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const dates = ['2026-01-06', '2026-01-11'];
        const results = [];

        for (const dateStr of dates) {
            const date = new Date(dateStr);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const articles = await News.find({
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            articles.forEach(article => {
                results.push({
                    id: article._id,
                    title: article.title,
                    content: article.content,
                    date: dateStr
                });
            });
        }

        fs.writeFileSync(path.join(__dirname, '../../found_articles.json'), JSON.stringify(results, null, 2), 'utf8');
        console.log('Done writing to found_articles.json');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
};

findArticles();
