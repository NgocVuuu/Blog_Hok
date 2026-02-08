const axios = require('axios');
const scraper = require('./services/OfficialNewsScraper');

// Monkey patch scraper to just use axios directly here for debugging
async function test() {
    console.log('Fetching list...');
    try {
        const payload = {
                "language": ["en"],
                "gameid": "9",
                "offset": 0,
                "get_num": 10,
                "ext_info_type_list": [0, 1, 2],
                "secondary_label_id": "576", 
                "content_class": 0,
                "primary_label_id": "566",
                "third_label_id": 0
            };
        
        const response = await axios.post(
            'https://hok-sg-community.playerinfinite.com/api/gpts.information_feeds_svr.InformationFeedsSvr/GetContentByLabel', 
            payload, 
            { 
                 headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Content-Type': 'application/json',
                    'Origin': 'https://www.honorofkings.com',
                    'Referer': 'https://www.honorofkings.com/'
                 }
            }
        );
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));


        if (response.data && response.data.data && response.data.data.info_content) {
             const list = response.data.data.info_content;
             const update = list.find(i => i.title.includes('Update')) || list[0];
             console.log('Inspecting:', update.title);
             console.log('ID:', update.content_id);
             
             // Now check detail
             const detailPayload = { "father_content_id": update.content_id };
             const detailResponse = await axios.post(
                'https://hok-sg-community.playerinfinite.com/api/gpts.information_feeds_svr.InformationFeedsSvr/GetContentInfoById',
                detailPayload,
                {
                     headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Content-Type': 'application/json',
                        'Origin': 'https://www.honorofkings.com',
                        'Referer': 'https://www.honorofkings.com/'
                     }
                }
             );
              if (detailResponse.data && detailResponse.data.data && detailResponse.data.data.content_info) {
                  const info = detailResponse.data.data.content_info;
                  console.log("Detail Info Keys: ", Object.keys(info));
                  if (info.html_content) console.log("Has 'html_content', length:", info.html_content.length);
                  if (info.content) console.log("Has 'content', length:", info.content.length);
                  if (info.desc) console.log("Has 'desc', length:", info.desc.length);
              }
        }

    } catch (e) {
        console.log(e);
    }
}

test();
