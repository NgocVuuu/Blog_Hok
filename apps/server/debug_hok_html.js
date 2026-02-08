const axios = require('axios');
const cheerio = require('cheerio');

async function inspect() {
    try {
        const response = await axios.get('https://www.honorofkings.com/global-en/news-list.html');
        const $ = cheerio.load(response.data);
        
        // Find the news list container. 
        // Based on the text content seen earlier, searching for "Server Update Announcement"
        // in the HTML might reveal the container.
        
        const newsItems = $('a').filter((i, el) => {
             return $(el).text().includes('Server Update Announcement');
        }).first().parent().parent(); // Guessing user hierarchy, might need adjustment

        console.log("HTML Sample of one item:");
        // Let's just find the list container by inspecting common patterns
        // Use a broader selector if specific one fails
        
        const listItems = $('.news-list li, .news-item, .article-list .item'); // Common selectors
        if (listItems.length > 0) {
            console.log(listItems.first().html());
            return;
        }

        // stricter search
        $('a').each((i, el) => {
            if ($(el).text().includes('Server Update Announcement')) {
                console.log("Found link with text 'Server Update Announcement':");
                console.log($.html(el));
                console.log('Parent HTML:');
                console.log($.html($(el).parent()));
                return false; // break
            }
        });

    } catch (e) {
        console.error(e);
    }
}

inspect();
