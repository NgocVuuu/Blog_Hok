#!/usr/bin/env node
/**
 * Manual trigger for HoK Official News Scraper
 * Can be run manually or via GitHub Actions
 */

const path = require('path');
const dotenv = require('dotenv');

// Load env
const serverEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serverEnvPath });

const { connectDB } = require('../config/db');
const { OfficialNewsScraper } = require('../services/OfficialNewsScraper');
const mongoose = require('mongoose');

async function run() {
    console.log('Starting Official News Scraper...');
    
    try {
        await connectDB();
        
        const scraper = new OfficialNewsScraper(console);
        const count = await scraper.scrapeOfficialNews();
        
        console.log(`✅ Scrape complete. Created/Updated drafts: ${count}`);
        
    } catch (error) {
        console.error('❌ Scrape failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected');
        process.exit(0);
    }
}

run();
