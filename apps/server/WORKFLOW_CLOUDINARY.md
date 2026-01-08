# Cloudinary Integration Workflow (Batch Strategy)

This document outlines the step-by-step process to migrate all Hero Avatars and Banners to Cloudinary using high-quality assets from the CN server.

## 1. Preparation & Source Identification
- **Source**: We use the static asset server of the original game (CN) because it is reliable and provides high-resolution images without anti-scraping blocks.
    - **Avatar URL Pattern**: `https://game.gtimg.cn/images/yxzj/img201606/heroimg/{id}/{id}.jpg`
    - **Banner URL Pattern**: `https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/{id}/{id}-bigskin-1.jpg`
- **Mapping**: We use `hokStaticProvider.js` to map Hero Names to their Official IDs (e.g., Angela -> 142).

## 2. Phase 1: Batch Download (Local)
**Script**: `apps/server/scripts/batchDownloadAssets.js`
1.  **Initialize**: Load the list of all heroes and their IDs.
2.  **Iterate**: For each hero:
    -   Check if the image already exists locally (to avoid re-downloading).
    -   Fetch the Avatar and Banner from the CN URL.
    -   Save them to:
        -   `apps/server/downloads/avatars/{slug}.jpg`
        -   `apps/server/downloads/banners/{slug}.jpg`
3.  **Result**: A local folder structure containing high-quality assets for all heroes named by their slug (e.g., `angela.jpg`).

## 3. Phase 2: Batch Upload & Database Update
**Script**: `apps/server/scripts/batchUploadAssets.js`
1.  **Initialize**: Connect to MongoDB and Cloudinary.
2.  **Scan**: Read files from the `downloads` directory.
3.  **Iterate**: For each file:
    -   Identify the hero based on the filename (slug).
    -   **Upload**: Send the file to Cloudinary into folders `BlogHok/heroes/avatars` or `BlogHok/heroes/banners`.
    -   **Update DB**: match the hero in MongoDB (`Hero.findOne({ slug })`) and update the `image` or `bannerImage` field with the returned `secure_url` from Cloudinary.
4.  **Optimization**: Use `Promise.allLimit` or sequential processing to handle uploads without hitting API rate limits.

## 4. Phase 3: Verification
1.  **Database Check**: Run a script to verify that no hero has an empty `image` or `bannerImage` and that all URLs contain `res.cloudinary.com`.
2.  **Client Check**: Open the web application and visually confirm that all images load fast and sharp.
