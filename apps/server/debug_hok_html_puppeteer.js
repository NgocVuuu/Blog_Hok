const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set user agent to avoid being blocked
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Navigating to news list...');
  await page.goto('https://www.honorofkings.com/global-en/news-list.html', { waitUntil: 'networkidle0' });

  // Get the news items
  const newsItems = await page.evaluate(() => {
    // Try to find the list container
    const newsListDiv = document.querySelector('.news-list-content, .news_list, .news-list'); 
    
    // Inspect the first item structure that looks like a news item
    // It seems from previous fetch output they are links `a` tags
    const links = Array.from(document.querySelectorAll('a'));
    const serverUpdateLink = links.find(l => l.innerText.includes('Server Update Announcement'));
    
    if (serverUpdateLink) {
        // Go up to find the item container
        let container = serverUpdateLink;
        // Looking for the `li` or wrapper `div`
        while (container && container.tagName !== 'LI' && !container.classList.contains('item')) {
             container = container.parentElement;
             if (container === document.body) break;
        }

        return {
            foundText: serverUpdateLink.innerText,
            href: serverUpdateLink.getAttribute('href'),
            containerHTML: container ? container.outerHTML : serverUpdateLink.outerHTML,
            containerClass: container ? container.className : 'N/A',
            // Structure of the link itself
            linkHTML: serverUpdateLink.outerHTML
        };
    }
    return null;
  });

  console.log('---- Analysis Result ----');
  console.log(JSON.stringify(newsItems, null, 2));

  await browser.close();
})();
