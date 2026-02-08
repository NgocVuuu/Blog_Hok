const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
require('dotenv').config();

const forceScrape = async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Enable request interception (currently disabled to check if blocking was the issue)
    /*
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) req.abort();
        else req.continue();
    });
    */

    console.log("Navigating to list to find link...");
    await page.goto('https://www.honorofkings.com/global-en/news-list.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.news_list li', { timeout: 60000 });
    
    const link = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.news_list li a'));
        const target = items.find(i => i.innerText.includes('2/05') && i.innerText.toLowerCase().includes('update'));
        return target ? target.href : null;
    });

    if (!link) {
        console.log("Could not find article in list.");
        await browser.close();
        return;
    }

    console.log(`Found Link: ${link}`);
    
    // Setup response listener BEFORE navigation
    page.on('response', async (response) => {
        const url = response.url();
        // Log API-like responses
        if (url.includes('api') || url.includes('json') || url.includes('detail') || url.includes('content') || url.includes('info')) {
            try {
                const contentType = response.headers()['content-type'] || '';
                if (contentType.includes('json') || contentType.includes('javascript') || contentType.includes('text/plain')) {
                    const text = await response.text();
                    // Log if it contains the ID or title text
                    if (text.includes('18e6c780af0a4a44daaa48ea767fdac1faef') || text.includes('Server Update')) {
                         console.log("\n\n>>> CAUGHT RELEVANT RESPONSE FROM:", url);
                         const json = JSON.parse(text);
                         if (json.data && json.data.content) {
                             console.log("---------------------------------------------------");
                             console.log("FULL CONTENT START:");
                             console.log("---------------------------------------------------");
                             console.log(json.data.content);
                             console.log("---------------------------------------------------");
                             console.log("FULL CONTENT END");
                             console.log("---------------------------------------------------");
                             
                             // Also save to file
                             const fs = require('fs');
                             fs.writeFileSync('205_content.html', json.data.content);
                             console.log("Saved to 205_content.html");
                         }
                    }
                }
            } catch (e) {
                // ignore
            }
        }
    });

    console.log("Navigating to Detail (High Timeout)...");
    await page.goto(link, { waitUntil: 'networkidle2', timeout: 90000 });
    
    console.log("Waiting for content to render (Max 60s)...");
    try {
        await page.waitForFunction(() => {
            const hasText = (node) => node && node.innerText.trim().length > 50;
            const c1 = document.querySelector('.news_detial_sin');
            const c2 = document.querySelector('.news_contin');
            const c3 = document.querySelector('.news_cont');
            return hasText(c1) || hasText(c2) || hasText(c3);
        }, { timeout: 60000 });
        console.log("Content detected!");
    } catch (e) {
        console.log("Timeout waiting for content match.");
    }

    // Inspect the DOM state
    const debugInfo = await page.evaluate(() => {
        const title = document.querySelector('.news_detail_t')?.innerText || "No Title";
        const contentDiv = document.querySelector('.news_detial_sin');
        
        let contentHTML = "No .news_detial_sin";
        let contentText = "No text";
        
        if (contentDiv) {
            contentHTML = contentDiv.innerHTML;
            contentText = contentDiv.innerText;
        } else {
             // Fallback to parent
             const parent = document.querySelector('.news_contin');
             if (parent) {
                  contentHTML = "Parent: " + parent.innerHTML;
                  contentText = "Parent: " + parent.innerText;
             }
        }
        
        return {
            title,
            contentHTML_preview: contentHTML.substring(0, 200),
            contentText_len: contentText.length,
            full_body_text_len: document.body.innerText.length
        };
    });

    console.log("---------------------------------------------------");
    console.log("DOM INSPECTION:");
    console.log(JSON.stringify(debugInfo, null, 2));
    console.log("---------------------------------------------------");

    await browser.close();
};

forceScrape();