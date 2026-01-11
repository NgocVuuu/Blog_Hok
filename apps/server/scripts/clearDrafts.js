const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

console.log('CWD:', process.cwd());

// Try to load .env from current directory (apps/server)
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Loaded .env file.');
} else {
    console.log('.env file NOT found at:', envPath);
    // Try one level up
    const rootEnv = path.resolve(process.cwd(), '../../.env');
    console.log('Trying root .env:', rootEnv);
    if (fs.existsSync(rootEnv)) {
        dotenv.config({ path: rootEnv });
        console.log('Loaded root .env');
    }
}

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Exists' : 'Missing');

const { connectDB } = require('../config/db');
const DraftChange = require('../models/DraftChange');

async function run() {
    try {
        await connectDB();
        console.log('Connected to DB');

        const res = await DraftChange.deleteMany({ status: 'PENDING' });
        console.log(`Deleted ${res.deletedCount} pending drafts.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
