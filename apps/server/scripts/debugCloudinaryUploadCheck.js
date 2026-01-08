const { uploadImageFromUrl } = require('../services/cloudinaryService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    const url = 'https://camp.honorofkings.com/Global/Common/UGUI/SystemRes/902_HeroSkillIcon/10930.png';
    // Use a unique ID to ensure we don't hit cache
    const uniqueId = `debug-daji-skill-${Date.now()}`;

    console.log(`Testing FORCE upload for: ${url}`);

    try {
        const result = await uploadImageFromUrl(url, 'BlogHok/heroes/debug', uniqueId);
        console.log('Upload Result URL:', result);
        console.log('Please open this URL in browser to verify it is NOT the placeholder.');
    } catch (e) {
        console.error('Upload Failed:', e);
    }
})();
