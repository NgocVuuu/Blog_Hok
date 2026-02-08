const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function debugScraper() {
    try {
        const url = 'https://www.honorofkings.com/global-en/news-list.html';
        console.log(`Fetching ${url}...`);
        const { data } = await axios.get(url);
        
        fs.writeFileSync(path.join(__dirname, 'dump_news.html'), data);
        console.log('Dumped HTML to dump_news.html');
        
    } catch (e) {
        console.error(e);
    }
}

debugScraper();