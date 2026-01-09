const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const Hero = require('../models/Hero');
const Equipment = require('../models/Equipment');
const Arcana = require('../models/Arcana');

// Load env
const serverEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serverEnvPath });

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function backup() {
    console.log('[Backup] Starting database backup...');

    // Ensure dir exists
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    try {
        await connectDB();

        // 1. Backup Heroes
        const heroes = await Hero.find({}).lean();
        const heroFile = path.join(BACKUP_DIR, 'heroes.json');
        fs.writeFileSync(heroFile, JSON.stringify(heroes, null, 2));
        console.log(`[Backup] Saved ${heroes.length} heroes to ${heroFile}`);

        // 2. Backup Equipments
        const items = await Equipment.find({}).lean();
        const itemFile = path.join(BACKUP_DIR, 'equipments.json');
        fs.writeFileSync(itemFile, JSON.stringify(items, null, 2));
        console.log(`[Backup] Saved ${items.length} equipments to ${itemFile}`);

        // 3. Backup Arcanas
        const arcanas = await Arcana.find({}).lean();
        const arcanaFile = path.join(BACKUP_DIR, 'arcanas.json');
        fs.writeFileSync(arcanaFile, JSON.stringify(arcanas, null, 2));
        console.log(`[Backup] Saved ${arcanas.length} arcanas to ${arcanaFile}`);

        console.log('[Backup] Completed successfully!');
        process.exit(0);

    } catch (err) {
        console.error('[Backup] Failed:', err);
        process.exit(1);
    }
}

backup();
