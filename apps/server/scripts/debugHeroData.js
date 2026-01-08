const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');
const { HeroDetailFetcher } = require('../services/heroDetailFetcher');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const targetName = 'Athena'; // Valid global hero
        const hero = await Hero.findOne({ name: targetName });

        console.log(`\n=== DB STATE: ${targetName} ===`);
        console.log(`ID: ${hero._id}`);
        console.log(`Lore Length: ${hero.lore ? hero.lore.length : 0}`);
        console.log(`Skins:`);
        hero.skins.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} (Img: ${!!s.image})`));

        console.log(`\n=== SCRAPER TEST ===`);
        const fetcher = new HeroDetailFetcher();
        const liquipediaData = await fetcher.fetchLiquipediaData(targetName);

        console.log(`\n--- Liquipedia Results ---`);
        if (liquipediaData) {
            console.log(`Title: ${liquipediaData.title}`);
            console.log(`Lore Length: ${liquipediaData.lore ? liquipediaData.lore.length : 0}`);
            console.log(`Lore Preview: ${liquipediaData.lore ? liquipediaData.lore.substring(0, 50) : 'N/A'}`);
            console.log(`Headers Found: ${(liquipediaData.debugHeaders || []).join(', ')}`);
            console.log(`Skins Found: ${liquipediaData.skins ? liquipediaData.skins.length : 0}`);
            if (liquipediaData.skins) {
                console.log(`Skin Names: ${liquipediaData.skins.map(s => s.name).join(', ')}`);
            }
        } else {
            console.log('Liquipedia Data: NULL');
        }

        const wikiData = await fetcher.fetchWikiData(targetName);
        console.log(`\n--- Wiki Results ---`);
        if (wikiData) {
            console.log(`Lore Length: ${wikiData.lore ? wikiData.lore.length : 0}`);
            console.log(`Skins Found: ${wikiData.skins ? wikiData.skins.length : 0}`);
        } else {
            console.log('Wiki Data: NULL');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
