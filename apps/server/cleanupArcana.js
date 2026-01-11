require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Arcana = require('./models/Arcana');

async function runCleanup() {
    if (!process.env.MONGODB_URI) {
        // Fallback to local default if env missing
        console.warn('MONGODB_URI not found. Using default.');
        process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/bloghok';
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Connected to DB: ${mongoose.connection.host}`);

        // 1. Delete "Lvl 5" duplicates
        // Regex: Matches "Lvl 5: ..." and "Lv 5: ..."
        const deleteResult = await Arcana.deleteMany({
            name: { $regex: /^(Lvl|Lv)\s*\d+\s*:/i }
        });

        console.log(`\n[Deleted] Removed ${deleteResult.deletedCount} Arcana entries with prefix "Lvl/Lv".`);

        // 2. Report on remaining Arcana
        const allArcana = await Arcana.find().lean();
        console.log(`[Status] Remaining Arcana count: ${allArcana.length}`);

        // Count colors
        const counts = { red: 0, green: 0, blue: 0, other: 0 };
        allArcana.forEach(a => {
            if (counts[a.color] !== undefined) counts[a.color]++;
            else counts.other++;
        });
        console.log('[Status] Color breakdown:', counts);

        // Disconnect
        await mongoose.connection.close();
        console.log('Cleanup script finished.');

    } catch (e) {
        console.error('Cleanup Error:', e);
        process.exit(1);
    }
}

runCleanup();
