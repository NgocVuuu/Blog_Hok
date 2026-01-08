const mongoose = require('mongoose');
const News = require('../models/News');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkLength = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find guides created by 'Antigravity (AI)' or just recent ones
        const guides = await News.find({ author: 'Antigravity (AI)' }).sort({ publishedAt: -1 });

        const fs = require('fs');
        let output = `Found ${guides.length} generated guides.\n\n`;
        output += `| Title | Words | Characters |\n`;
        output += `| :--- | :---: | :---: |\n`;

        guides.forEach(g => {
            const content = g.content || '';
            const words = content.trim().split(/\s+/).length;
            const chars = content.length;
            const shortTitle = g.title.length > 40 ? g.title.substring(0, 37) + '...' : g.title;
            const padTitle = shortTitle.padEnd(40, ' ');
            output += `| ${padTitle} | ${words} | ${chars} |\n`;
        });

        fs.writeFileSync(path.join(__dirname, 'guide_lengths.txt'), output);
        console.log('Output written to guide_lengths.txt');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

checkLength();
