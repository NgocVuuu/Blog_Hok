const mongoose = require('mongoose');
const Arcana = require('../models/Arcana');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function clean() {
    if (!process.env.MONGODB_URI) throw new Error('No Mongo URI');
    await mongoose.connect(process.env.MONGODB_URI);

    const arcanas = await Arcana.find({});
    console.log(`Scanning ${arcanas.length} arcanas for duplicates...`);

    const map = new Map();
    const toDelete = [];

    for (const a of arcanas) {
        const slug = slugify(a.name);

        if (!map.has(slug)) {
            map.set(slug, a);
        } else {
            const existing = map.get(slug);
            // Decide which one to keep
            // Prefer one with valid attributes?
            const existingHasStats = existing.attributes && Object.values(existing.attributes).some(v => v > 0);
            const currentHasStats = a.attributes && Object.values(a.attributes).some(v => v > 0);

            let keepExisting = true;

            if (!existingHasStats && currentHasStats) {
                keepExisting = false;
            } else if (existingHasStats && currentHasStats) {
                // If both have stats, prefer the one with cleaner name (shorter?)
                if (a.name.length < existing.name.length) keepExisting = false;
            } else if (!existingHasStats && !currentHasStats) {
                if (a.name.length < existing.name.length) keepExisting = false;
            }

            if (keepExisting) {
                console.log(`Duplicate found: ${a.name} (Delete) vs ${existing.name} (Keep)`);
                toDelete.push(a._id);
            } else {
                console.log(`Duplicate found: ${existing.name} (Delete) vs ${a.name} (Keep)`);
                toDelete.push(existing._id);
                map.set(slug, a);
            }
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicates...`);
        await Arcana.deleteMany({ _id: { $in: toDelete } });
        console.log('Deleted.');
    } else {
        console.log('No duplicates found.');
    }

    await mongoose.connection.close();
}

clean().catch(console.error);
