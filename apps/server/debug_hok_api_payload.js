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
      if (url.includes('GetContentByLabel')) {
          console.log('--- REQUEST ---');
          console.log('URL:', url);
          console.log('Method:', request.method());
          console.log('Post Data:', request.postData());
          // console.log('Headers:', request.headers());
      }
  });

  console.log('Navigating to news list...');
  try {
    await page.goto('https://www.honorofkings.com/global-en/news-list.html', { waitUntil: 'networkidle0', timeout: 60000 });
  } catch (e) {
      console.log("Error or timeout", e.message);
  }

  await browser.close();
})();
