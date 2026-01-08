const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36');

    console.log('Setting up interception...');
    await page.setRequestInterception(true);

    page.on('request', request => {
        if (request.url().includes('getranklist')) {
            console.log('Found API Request:', request.url());
            console.log('Method:', request.method());
            console.log('Headers:', JSON.stringify(request.headers(), null, 2));
            console.log('Post Data:', request.postData());
            fs.writeFileSync('api_headers.json', JSON.stringify(request.headers(), null, 2));
        }
        request.continue();
    });

    page.on('response', async response => {
        if (response.url().includes('getranklist')) {
            console.log('API Response Status:', response.status());
            try {
                const json = await response.json();
                fs.writeFileSync('api_response_sample.json', JSON.stringify(json, null, 2));
                console.log('API Response saved to api_response_sample.json');
            } catch (e) {
                console.log('Could not parse response JSON');
            }
        }
    });

    // The rank list is likely on the main page or a specific stats page.
    // Let's try the hero list page or similar.
    // The user url was .../app/index.html...
    // Let's try accessing the 'Hero' tab or similar if possible. 
    // Usually these SPAs load initial data on load.

    const url = 'https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official#/hero-list';
    console.log(`Navigating to ${url}...`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Page loaded');
    } catch (e) {
        console.error('Navigation error:', e.message);
    }

    // Wait a bit to ensure requests fire
    await new Promise(r => setTimeout(r, 10000));

    await browser.close();
})();
