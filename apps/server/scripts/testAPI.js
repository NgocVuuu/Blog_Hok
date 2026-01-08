const axios = require('axios');

async function testAPIs() {
    const mobileUA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': mobileUA,
        'camp-os': 'web',
        'camp-lang': 'en'
    };

    try {
        console.log('Testing gethero...');
        const res1 = await axios.post('https://api-camp.honorofkings.com/api/herowiki/gethero', { heroId: 142 }, { headers });
        console.log('gethero status:', res1.status);
    } catch (e) {
        console.log('gethero failed:', e.message, e.response?.status);
    }

    try {
        console.log('Testing getherodataall...');
        const res2 = await axios.post('https://api-camp.honorofkings.com/api/herowiki/getherodataall', { heroId: 142 }, { headers });
        console.log('getherodataall status:', res2.status);
        console.log('getherodataall data keys:', Object.keys(res2.data));
    } catch (e) {
        console.log('getherodataall failed:', e.message, e.response?.status);
    }
}

testAPIs();
