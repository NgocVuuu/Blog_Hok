const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');
const { HeroDetailFetcher } = require('../services/heroDetailFetcher');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find heroes without Lore
        const targetHeroes = await Hero.find({ $or: [{ lore: { $exists: false } }, { lore: "" }] }, 'name');
        console.log(`Found ${targetHeroes.length} heroes needing Lore.`);

        const fetcher = new HeroDetailFetcher(console);

        for (const h of targetHeroes) {
            console.log(`[PatchLore] Fetching for ${h.name}...`);
            try {
                // Fetch specifically from Wiki
                const wikiData = await fetcher.fetchWikiData(h.name);

                if (wikiData && wikiData.lore && wikiData.lore.length > 50) {
                    await Hero.updateOne({ _id: h._id }, { $set: { lore: wikiData.lore } });
                    console.log(`   > Updated Lore (${wikiData.lore.length} chars)`);
                } else {
                    console.log(`   > No Lore found.`);
                    // Fallback to liquipedia?
                }

                // Rate limit
                await new Promise(r => setTimeout(r, 2000));
            } catch (e) {
                console.error(`   > Error: ${e.message}`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
