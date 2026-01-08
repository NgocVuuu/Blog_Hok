const axios = require('axios');
const fs = require('fs');
const path = require('path');

(async () => {
    const url = 'https://camp.honorofkings.com/Global/Common/UGUI/SystemRes/902_HeroSkillIcon/10930.png';
    const outputPath = path.resolve(__dirname, 'test_skill.png');

    console.log(`Downloading: ${url}`);

    // Exact headers from cloudinaryService.js
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://camp.honorofkings.com/'
    };

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: headers
        });

        fs.writeFileSync(outputPath, response.data);
        console.log(`Saved to ${outputPath}`);
        console.log(`Size: ${response.data.length} bytes`);

        // Check for tiny file (indicates error/placeholder)
        if (response.data.length < 1000) {
            console.warn('WARNING: File size is suspiciously small. Likely an error/placeholder.');
            console.log('Content Preview:', response.data.toString().substring(0, 100));
        } else {
            console.log('File size looks reasonable for an image.');
        }

    } catch (e) {
        console.error('Download Failed:', e.message);
    }
})();
