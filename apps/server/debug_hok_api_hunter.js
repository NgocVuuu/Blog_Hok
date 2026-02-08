const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept requests to find the API
  page.on('response', async response => {
      const url = response.url();
      if ((url.includes('api') || url.includes('json') || url.includes('list') || url.includes('feeds')) && !url.endsWith('.js') && !url.endsWith('.css') && !url.endsWith('.png')) {
          try {
             // Only look at small-ish responses that might be JSON
             const contentType = response.headers()['content-type'];
             if (contentType && contentType.includes('application/json')) {
                 const text = await response.text(); // Use text() to avoid JSON parse errors
                 if (text.includes('Server Update Announcement')) {
                     console.log('!!! FOUND API ENDPOINT !!!');
                     console.log('URL:', url);
                     // console.log('Response Snippet:', text.substring(0, 500));
                 }
             }
          } catch (e) {
              // ignore
          }
      }
  });

  console.log('Navigating to news list...');
  try {
      await page.goto('https://www.honorofkings.com/global-en/news-list.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait for the news items to appear
      console.log('Waiting for content...');
      await page.waitForSelector('a', { timeout: 30000 });
      
      // Wait a bit more for dynamic content
      await new Promise(r => setTimeout(r, 5000));

      const newsItems = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const serverUpdateLink = links.find(l => l.innerText.includes('Server Update Announcement'));
        
        if (serverUpdateLink) {
             const parent = serverUpdateLink.closest('li') || serverUpdateLink.parentElement;
             return {
                 found: true,
                 text: serverUpdateLink.innerText,
                 href: serverUpdateLink.href,
                 parentHtml: parent ? parent.innerHTML : '',
                 parentClass: parent ? parent.className : '',
                 listContainerClass: parent && parent.parentElement ? parent.parentElement.className : '' 
             };
        }
        return { found: false };
      });
      
      console.log('DOM Evaluation:', newsItems);

  } catch (e) {
      console.error('Puppeteer error:', e);
  }

  await browser.close();
})();
