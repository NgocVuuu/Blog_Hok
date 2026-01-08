const { uploadImageFromUrl } = require('../services/cloudinaryService');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
    // configured cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Create a 1x1 Transparent PNG (Base64)
    // 1x1 pixel red
    const redPngParams = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(redPngParams, 'base64');

    // Write detailed file
    const tempPath = path.join(__dirname, 'dummy_red.png');
    fs.writeFileSync(tempPath, buffer);
    console.log('Created dummy_red.png');

    try {
        console.log('Uploading dummy_red.png...');
        // We use the raw uploader first to bypass service logic if needed, 
        // but let's test the direct upload call to match service.
        const result = await cloudinary.uploader.upload(tempPath, {
            folder: 'BlogHok/heroes/debug',
            public_id: `dummy-red-${Date.now()}`,
            overwrite: true
        });

        console.log(`Upload Success: ${result.secure_url}`);

        // Verify immediately
        console.log('Verifying URL...');
        const check = await fetch(result.secure_url);
        console.log(`URL Status: ${check.status} ${check.statusText}`);

    } catch (e) {
        console.error('Upload Failed', e);
    } finally {
        fs.unlinkSync(tempPath);
    }
})();
