const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: serverEnvPath });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: rootEnvPath });
}
const { connectDB } = require('../config/db');

async function scrapePatchNotes() {
    const targetHeroId = 109; // Daji
    const url = `https://camp.honorofkings.com/h5/app/index.html#/adjustment-detail?heroId=${targetHeroId}&versionName=20241128`;

    console.log(`Launching Puppeteer to scrape ${url}...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 375, height: 667, isMobile: true }); // Mobile view

        // Intercept API responses
        page.on('response', async (response) => {
            const respUrl = response.url();
            if (respUrl.includes('/api/game/adjust/adjustheroinfo') || respUrl.includes('adjust')) {
                console.log('Intercepted API response from:', respUrl);
                try {
                    const json = await response.json();
                    console.log('API Data:', JSON.stringify(json, null, 2));
                } catch (e) {
                    console.log('Could not parse JSON from intercept');
                }
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Page loaded. Waiting for content...');

        // Wait for a bit to let JS render
        await new Promise(r => setTimeout(r, 5000));

        const title = await page.title();
        console.log('Page Title:', title);

        // Extract text content just in case API intercept failed
        const content = await page.evaluate(() => document.body.innerText);
        console.log('Body Text Preview:', content.substring(0, 500));

    } catch (err) {
        console.error('Puppeteer Error:', err.message);
    } finally {
        await browser.close();
        process.exit();
    }
}

scrapePatchNotes();
