const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  page.on('request', request => {
      const url = request.url();
      if (url.includes('api') && !url.includes('.js')) {
          console.log('--- REQUEST ---');
          console.log('URL:', url);
          console.log('Method:', request.method());
          if (request.method() === 'POST') {
             console.log('Post Data:', request.postData());
          }
      }
  });

  page.on('response', async response => {
      const url = response.url();
      if (url.includes('GetContentDetail') || url.includes('GetContentByLabel')) {
           try {
               const text = await response.text();
               console.log('--- RESPONSE (' + url.split('/').pop() + ') ---');
               console.log(text.substring(0, 500) + '...');
           } catch(e) {}
      }
  });

  const targetUrl = 'https://www.honorofkings.com/global-en/news-detail.html?from=2&tid=0&sid=576&pid=0&news_type=&father_content_id=18e6c780af0a4a44daaa48ea767fdac1faef&content_id=18e6c780af0a4a44daaa48ea767fdac1faef';
  console.log('Navigating to detail page:', targetUrl);
  
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
      console.log("Error or timeout", e.message);
  }

  await browser.close();
})();
