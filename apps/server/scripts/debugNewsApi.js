const axios = require('axios');

async function checkApi() {
    try {
        console.log('Fetching News with status=all...');
        const res = await axios.get('http://localhost:7000/api/news?status=all');
        const posts = res.data.success ? res.data.data : res.data;

        console.log(`Total Posts: ${posts.length}`);

        const drafts = posts.filter(p => p.status === 'draft');
        const published = posts.filter(p => p.status === 'published');
        const undefinedStatus = posts.filter(p => !p.status);

        console.log(`Drafts: ${drafts.length}`);
        console.log(`Published: ${published.length}`);
        console.log(`Undefined Status: ${undefinedStatus.length}`);

        if (drafts.length > 0) {
            console.log('Sample Draft:', drafts[0].title);
        }

    } catch (err) {
        console.error('Error fetching API:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

checkApi();
