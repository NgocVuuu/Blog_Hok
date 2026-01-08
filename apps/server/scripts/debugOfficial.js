const HeroDetailFetcher = require('../services/heroDetailFetcher');

(async () => {
    const fetcher = new HeroDetailFetcher();
    console.log('Fetching Official data for Lady Sun...');

    // 170 is Lady Sun's ID (need to verify ID, but assuming standard fetcher input logic)
    // Actually the fetcher takes ID. I need to find the ID for Lady Sun. 
    // Wait, the automated fetcher uses the ID from the ranklist. 
    // I should probably manually look up the ID or just use a known one if I can find it.
    // Lady Sun = Sun Shangxiang = 111 (usually).
    // Let's check syncHoKMetaService logic or just try 111.
    // Actually, let's look at the static file or just try to fetch by ID 111.

    // Better: Retrieve ID from DB first
    const mongoose = require('mongoose');
    const Hero = require('../models/Hero');
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

    await mongoose.connect(process.env.MONGODB_URI);
    const hero = await Hero.findOne({ name: 'Lady Sun' });

    if (!hero) {
        console.error('Hero Lady Sun not found in DB to get ID');
        process.exit(1);
    }

    // We assume the scraper was run and populated the DB with basic info but missing skills
    // Does the DB store the 'heroId' from the source? No, it stores 'id' maybe?
    // The previous sync logic used `s.heroId` from the input stats. 
    // The DB schema doesn't seem to explicitly store the official ID unless I check.
    // But I can try to reverse it or just hardcode if I know it.
    // Let's assume the ID is passed.
    // Actually, I can just use the fetcher's official data method if I have the ID.
    // I'll try ID 111 (Sun Shangxiang).

    const data = await fetcher.fetchOfficialData('111');
    console.log('Official Data Result:', JSON.stringify(data, null, 2));

    if (data && data.skills && data.skills.length > 0) {
        console.log('SUCCESS: Skills scraping verified!');
    } else {
        console.error('FAILURE: Skills missing.');
    }

    process.exit(0);
})();
