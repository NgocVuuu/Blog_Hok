const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), 'apps', 'server', '.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloghok';

async function testSchema() {
    await mongoose.connect(MONGO_URI);
    console.log('DB Connected');

    const testData = {
        name: 'TestChicha',
        title: 'Test Title',
        image: 'test.jpg',
        roles: ['Fighter'],
        metaTier: 'S',
        skillBuilds: [
            {
                name: 'Build 1',
                skills: [
                    { name: 'Skill 1', description: 'Desc 1' }
                ]
            },
            {
                name: 'Build 2',
                skills: [
                    { name: 'Skill 2', description: 'Desc 2' }
                ]
            }
        ]
    };

    try {
        const hero = await Hero.findOne({ slug: 'chicha' });
        if (hero) {
            console.log('Found Chicha. Updating skillBuilds...');
            const res = await Hero.updateOne({ _id: hero._id }, { $set: { skillBuilds: testData.skillBuilds } });
            console.log('Update Result:', res);

            const updated = await Hero.findOne({ slug: 'chicha' });
            console.log('Chicha SkillBuilds after update:', updated.skillBuilds.length);
        } else {
            console.log('Chicha not found');
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error('Update failed:', e);
        await mongoose.disconnect();
    }
}

testSchema();
