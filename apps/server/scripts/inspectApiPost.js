const https = require('https');

const url = 'https://api-camp.honorofkings.com/game/hero/getranklist';

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://camp.honorofkings.com/',
        'Origin': 'https://camp.honorofkings.com'
    }
};

const req = https.request(url, options, (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

// JSON body might be required. Sending empty object for now.
req.write(JSON.stringify({}));
req.end();
