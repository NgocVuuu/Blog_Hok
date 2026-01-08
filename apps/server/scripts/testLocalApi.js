const axios = require('axios');

(async () => {
    // Assuming server runs on port 5000, adjust if needed (e.g. from .env or previous context)
    const url = 'http://127.0.0.1:5000/api/heroes/slug/angela';
    console.log(`Fetching ${url}...`);
    try {
        const res = await axios.get(url);
        console.log('Status:', res.status);
        const hero = res.data;
        console.log('Hero Name:', hero.name);
        console.log('Hero Image:', hero.image);
        console.log('Hero Banner:', hero.bannerImage);

        if (hero.bannerImage && hero.bannerImage.includes('cloudinary')) {
            console.log('SUCCESS: Banner Image is present and from Cloudinary.');
        } else {
            console.log('FAIL: Banner Image is missing or invalid.');
        }

    } catch (e) {
        console.error('Error fetching API:', e.message);
        if (e.response) {
            console.log('Response data:', e.response.data);
        }
    }
})();
