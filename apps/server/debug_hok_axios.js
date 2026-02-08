const axios = require('axios');

async function inspect() {
    try {
        console.log("Fetching...");
        const response = await axios.get('https://www.honorofkings.com/global-en/news-list.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const data = response.data;
        console.log("Length:", data.length);
        
        if (data.includes('Server Update Announcement')) {
             console.log("Content FOUND in static HTML!");
             const index = data.indexOf('Server Update Announcement');
             console.log(data.substring(index - 500, index + 500));
        } else {
             console.log("Content NOT found in static HTML. It is likely dynamically loaded.");
             // Print some context around "news" or "list" to see if there is JSON data or empty container
             const listIndex = data.indexOf('news-list');
             if (listIndex !== -1) {
                 console.log("Found 'news-list' at index " + listIndex);
                 console.log(data.substring(listIndex - 200, listIndex + 500));
             }
        }

    } catch (e) {
        console.error(e.message);
    }
}

inspect();
