const axios = require('axios');
const fs = require('fs');

async function fetchOfficial() {
    try {
        const heroId = 142; // Angela
        const url = 'https://api-camp.honorofkings.com/api/herowiki/getherodataall';
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://camp.honorofkings.com/',
            'Origin': 'https://camp.honorofkings.com',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'camp-os': 'web',
            'camp-lang': 'en'
        };

        const response = await axios.post(url, { heroId }, { headers });
        console.log('Response Status:', response.status);

        fs.writeFileSync('debug_angela_official.json', JSON.stringify(response.data, null, 2));
        console.log('Data saved to debug_angela_official.json');

    } catch (e) {
        console.error('Error:', e.message);
    }
}

fetchOfficial();
