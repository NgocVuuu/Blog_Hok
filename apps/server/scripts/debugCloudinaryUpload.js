const { uploadImageFromUrl } = require('../services/cloudinaryService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    const url = 'https://camp.honorofkings.com/Global/Common/UGUI/SystemRes/902_HeroSkillIcon/10930.png';
    console.log(`Testing upload for: ${url}`);

    try {
        const result = await uploadImageFromUrl(url, 'BlogHok/heroes/debug', 'debug-daji-skill');
        console.log('Upload Result:', result);
    } catch (e) {
        console.error('Upload Failed:', e);
    }
})();
