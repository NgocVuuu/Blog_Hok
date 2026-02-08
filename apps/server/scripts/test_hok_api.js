const axios = require('axios');

async function testApi() {
    const host = 'https://hok-sg-community.playerinfinite.com';
    const gameId = '9';
    const lang = 'en';

    try {
        console.log('Fetching Feeds for Label 576...');
        const feedUrl = `${host}/api/gpts.information_feeds_svr.InformationFeedsSvr/GetContentByLabelV2`;
        
        // Payload based on SDK analysis
        const feedPayload = {
            gameid: '9', // String
            language: [lang],
            secondary_label_id: '576', 
            content_class: "0", // String
            get_num: "15", // String
            offset: "0" // String
        };
        
        const { data: feedData } = await axios.post(feedUrl, feedPayload, {
                headers: { 'Content-Type': 'application/json', 'source_type': 'pc_web' }
        });
        
        console.log('Feeds Response:', JSON.stringify(feedData, null, 2).substring(0, 15000));

    } catch (e) {
        console.error('API Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data));
        }
    }
}

testApi();