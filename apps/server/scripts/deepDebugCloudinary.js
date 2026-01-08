const { uploadImageFromUrl } = require('../services/cloudinaryService');
const axios = require('axios');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    const url = 'https://camp.honorofkings.com/Global/Common/UGUI/SystemRes/902_HeroSkillIcon/10930.png';
    console.log(`[DeepDebug] Target URL: ${url}`);

    // 1. Check Download Validity
    console.log('\n[DeepDebug] Step 1: Checking Download Content...');
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://camp.honorofkings.com/'
            }
        });
        console.log('   Axios response received.');

        const buffer = Buffer.from(response.data);
        console.log(`   Status: ${response.status}`);
        console.log(`   Size: ${buffer.length} bytes`);
        console.log(`   First 50 bytes (Hex): ${buffer.subarray(0, 50).toString('hex')}`);

        // Check PNG Magic Bytes (89 50 4E 47 0D 0A 1A 0A)
        const isPng = buffer.toString('hex').startsWith('89504e47');
        console.log(`   Is PNG? ${isPng ? 'YES' : 'NO'}`);

        if (!isPng) {
            console.log(`   Content as Text: ${buffer.subarray(0, 200).toString('utf8')}`);
            console.error('[DeepDebug] ABORTING: Downloaded content is not a PNG.');
            process.exit(1);
        }

    } catch (e) {
        console.error(`[DeepDebug] Download Error: ${e.message}`);
        process.exit(1);
    }

    // 2. Check Upload via Service
    console.log('\n[DeepDebug] Step 2: Testing Cloudinary Upload...');
    try {
        // We will call cloudinary directly here to see the FULL response object, 
        // bypassing the wrapper's simplified return for a moment.
        // Copying the stream logic from service to reproduce exactly.

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const options = {
            folder: 'BlogHok/heroes/debug',
            overwrite: true,
            resource_type: 'image',
            public_id: `deep-debug-${Date.now()}`
        };

        // Redo fetch to get fresh stream (mocking the service internals)
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://camp.honorofkings.com/'
            }
        });

        const stream = require('stream');
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            const bufferStream = new stream.PassThrough();
            bufferStream.end(Buffer.from(response.data));
            bufferStream.pipe(uploadStream);
        });

        const result = await uploadPromise;
        console.log('[DeepDebug] Cloudinary Full Response:');
        console.log(JSON.stringify(result, null, 2));
        console.log(`[DeepDebug] Check this URL: ${result.secure_url}`);

    } catch (e) {
        console.error('[DeepDebug] Upload Error:', e);
    }

})();
