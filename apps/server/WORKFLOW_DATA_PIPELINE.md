# HoK Data Pipeline & Workflow

This document outlines the comprehensive process for synchronizing Hero Data and Images for the BlogHok application.

## Overview
The pipeline consists of two main parallel flows:
1.  **Data Synchronization**: Fetching text data (stats, skills, lore, builds) from Official Sources and Wiki.
2.  **Asset Management**: Batch downloading high-quality images from the CN server and hosting them on Cloudinary.

---

## Part A: Data Synchronization (Text & Logic)
**Main Script**: `npm run sync-hok` (runs `apps/server/scripts/syncHoKMeta.js`)

### 1. Source Identification
-   **Static Base**: We start with a static JSON list (`hok_ranklist.json` or inline) to get the base list of heroes and their current Meta Tier/Win Rates.
-   **Official ID Mapping**: We use `hokStaticProvider.js` to map Hero Names to Official IDs (e.g., Angela -> 142).

### 2. Scraping Process (`heroDetailFetcher.js`)
For each hero, the system performs a "Heal" or "Create" process:
1.  **Official Data (Primary)**:
    -   Connects to `camp.honorofkings.com` using Puppeteer.
    -   Intercepts API calls (`getinformationcard`) or scrapes the DOM to get:
        -   Avatar URL.
        -   Skill list (Icons, Names, Descriptions, Cooldowns).
        -   Recommended Builds (Equipment) & Arcana.
2.  **Wiki Data (Fallback/Enrichment)**:
    -   Connects to `honor-of-kings.fandom.com`.
    -   Extracts:
        -   **Lore**: Background story.
        -   **Skins**: List of skin names and images.
        -   **Relationships**: Partners, Counterpicks.
        -   **Lanes/Classes**: Role information.

### 3. Data Merging
-   The system prioritizes **Official Data** for core stats (Tier, Win Rate) and Skills.
-   It uses **Wiki Data** for Lore and Relationships.
-   It saves the combined object to MongoDB (`Hero` collection).

---

## Part B: Image Asset Management (Batch Cloudinary)
**Goal**: Ensure all heroes have high-resolution Avatars and Banners hosted on Cloudinary, bypassing external hotlinking issues.

### 1. Preparation & Source
-   **Source**: CN Static Server (`game.gtimg.cn`).
    -   Avatar: `.../heroimg/{id}/{id}.jpg`
    -   Banner: `.../skin/hero-info/{id}/{id}-bigskin-1.jpg`

### 2. Phase 1: Batch Download (Local)
**Script**: `node apps/server/scripts/batchDownloadAssets.js`
-   Iterates through all heroes found in the database/static list.
-   Downloads Avatar and Banner from the CN Source.
-   Saves to local folders: `apps/server/downloads/avatars/` and `apps/server/downloads/banners/`.

### 3. Phase 2: Batch Upload & Link
**Script**: `node apps/server/scripts/batchUploadAssets.js`
-   Scans the local `downloads` folder.
-   Uploads each image to Cloudinary (Folders: `BlogHok/heroes/avatars` & `BlogHok/heroes/banners`).
-   Updates the MongoDB `Hero` document with the permanent `res.cloudinary.com` URL.

---

## Summary of Commands

| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Full Sync (Data)** | `npm run sync-hok` | Syncs text data, stats, and meta tiers. |
| **Heal Specific Hero** | `node apps/server/scripts/syncHoKMeta.js --heal` | Re-scrapes data for broken/specific heroes. |
| **Download Images** | `node apps/server/scripts/batchDownloadAssets.js` | Downloads high-res assets to local disk. |
| **Upload Images** | `node apps/server/scripts/batchUploadAssets.js` | Uploads local assets to Cloudinary & updates DB. |
