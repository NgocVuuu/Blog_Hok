const axios = require('axios');

(async () => {
    const url = 'https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767531108/BlogHok/heroes/skills/daji-skill-captivate-1767531108449.png';
    console.log(`Checking URL: ${url}`);

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        console.log(`Status: ${response.status}`);
        console.log(`Size: ${response.data.length} bytes`);
        const header = response.data.subarray(0, 10).toString('hex');
        console.log(`MagicBytes: ${header}`);

        if (response.data.length < 5000) {
            console.log('WARNING: File is dangerously small. Likely placeholder.');
        } else {
            console.log('File size suggests VALID image.');
        }

    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
})();
