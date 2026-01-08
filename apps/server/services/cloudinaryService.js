const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const stream = require('stream');
const fs = require('fs');

let cloudinaryEnabled = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryEnabled = true;
} else {
    console.warn('[CloudinaryService] Missing configuration. Uploads will be skipped.');
}

/**
 * Upload an image from a URL to Cloudinary.
 * Tries direct URL upload first, then falls back to fetching the buffer.
 * @param {string} imageUrl - The URL of the image to upload.
 * @param {string} folder - The folder in Cloudinary (default: 'BlogHok/heroes').
 * @returns {Promise<string|null>} - The secure URL of the uploaded image, or null if failed.
 */
async function uploadImageFromUrl(imageUrl, folder = 'BlogHok/heroes', publicId = null) {
    if (!cloudinaryEnabled || !imageUrl) return imageUrl;

    // If it's already a Cloudinary URL, skip
    if (imageUrl.includes('res.cloudinary.com')) return imageUrl;

    const options = {
        folder: folder,
        overwrite: true,
        resource_type: 'image'
    };
    if (publicId) options.public_id = publicId;

    try {
        // Force fallback for HoK ecosystem URLs because they require Referer headers
        // which Cloudinary's server-side fetch cannot provide.
        if (imageUrl.includes('honorofkings.com') || imageUrl.includes('qq.com') || imageUrl.includes('gtimg.cn') || imageUrl.includes('liquipedia.net')) {
            throw new Error('HoK/QQ/CN/Liquipedia URL detected. Forcing local download with headers.');
        }

        console.log(`[Cloudinary] Attempting direct upload: ${imageUrl}`);
        const result = await cloudinary.uploader.upload(imageUrl, options);
        return result.secure_url;
    } catch (directError) {
        console.warn(`[Cloudinary] Direct upload failed (${directError.message}). Trying fallback fetch...`);

        try {
            // Determine Referer based on domain
            let referer = 'https://camp.honorofkings.com/';
            if (imageUrl.includes('qq.com') || imageUrl.includes('gtimg.cn')) {
                referer = 'https://pvp.qq.com/';
            }

            // Fallback: Fetch to temp file and upload
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    // 'Referer': referer, // Liquipedia might block hotlinking via Referer. Try NO referer.
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Sec-Fetch-Dest': 'image',
                    'Sec-Fetch-Mode': 'no-cors',
                    'Sec-Fetch-Site': 'cross-site'
                }
            });

            const tempFilePath = path.join(__dirname, `temp_upload_${Date.now()}.png`);
            fs.writeFileSync(tempFilePath, response.data);

            console.log(`[CloudinaryService] Downloaded to ${tempFilePath}`);
            console.log(`[CloudinaryService] Size: ${response.data.length}`);
            const firstBytes = Buffer.isBuffer(response.data) ? response.data.subarray(0, 10).toString('hex') : 'Not Buffer';
            console.log(`[CloudinaryService] MagicBytes: ${firstBytes}`);

            try {
                const result = await cloudinary.uploader.upload(tempFilePath, options);
                fs.unlinkSync(tempFilePath); // Clean up
                return result.secure_url;
            } catch (uploadErr) {
                console.error(`[Cloudinary] File upload failed: ${uploadErr.message}`);
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                return null;
            }

        } catch (fetchError) {
            console.error(`[Cloudinary] Fallback fetch failed: ${fetchError.message}`);
            return null;
        }
    }
}

module.exports = { uploadImageFromUrl, cloudinaryEnabled };
