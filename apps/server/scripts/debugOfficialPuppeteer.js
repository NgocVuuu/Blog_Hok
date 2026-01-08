const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchWithPuppeteer() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.setRequestInterception(false); // We just listen

        let apiData = null;

        // Setup wait BEFORE navigation
        const apiResponsePromise = page.waitForResponse(response =>
            response.url().includes('getherodataall')
            , { timeout: 30000 }).catch(e => null);

        // Go to the page (Hash URL)
        console.log('Navigating to Hash URL...');
        await page.goto('https://camp.honorofkings.com/h5/app/index.html#/hero-detail?heroId=142', { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Waiting for API response...');
        const response = await apiResponsePromise;

        if (response) {
            console.log('Intercepted API call:', response.url(), 'Status:', response.status());
            try {
                const json = await response.json();
                if (json.data) {
                    console.log('Data Keys:', Object.keys(json.data));
                    if (json.data.equip) {
                        console.log('Equip Type:', typeof json.data.equip);
                        console.log('Equip Structure:', JSON.stringify(json.data.equip, null, 2).substring(0, 1000));
                    }
                    if (json.data.arcana) {
                        console.log('Arcana Type:', typeof json.data.arcana);
                        console.log('Arcana Structure:', JSON.stringify(json.data.arcana, null, 2).substring(0, 1000));
                    }
                } else {
                    console.log('No data field in JSON');
                }
            } catch (e) { console.log('JSON parse error', e); }
        } else {
            console.log('API response timed out or failed.');
        }

    } catch (e) {
        console.error('Puppeteer Error:', e);
    } finally {
        await browser.close();
    }
}

fetchWithPuppeteer();
