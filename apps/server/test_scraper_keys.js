const scraper = require('./services/OfficialNewsScraper');

async function test() {
    console.log('Fetching list...');
    const list = await scraper.fetchNewsList();
    console.log(`Found ${list.length} items`);
    if (list.length > 0) {
        // Find one update
        const update = list.find(i => i.title.includes('Update')) || list[0];
        console.log('Inspecting:', update.title);
        console.log('ID:', update.content_id);
        
        console.log('Fetching detail...');
        const detail = await scraper.fetchArticleDetail(update.content_id);
        if (detail) {
            console.log('Detail Keys:', Object.keys(detail));
            // Log a snippet of content fields to identify which one holds the HTML
            ['content', 'data', 'html_content', 'body', 'text', 'desc'].forEach(k => {
                if (detail[k]) console.log(`Field [${k}] length: ${detail[k].length}`);
            });
        }
    }
}

test();
