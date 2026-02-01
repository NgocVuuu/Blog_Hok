const express = require('express');
const router = express.Router();
const DraftChange = require('../models/DraftChange');
const Hero = require('../models/Hero');
const { uploadImageFromUrl } = require('../services/cloudinaryService');

// GET /api/drafts - List pending drafts
router.get('/', async (req, res) => {
    try {
        const drafts = await DraftChange.find({ status: 'PENDING' }).sort({ discoveredAt: -1 });
        res.json({ success: true, data: drafts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/drafts/:id/approve - Approve a draft
router.post('/:id/approve', async (req, res) => {
    try {
        const draft = await DraftChange.findById(req.params.id);
        if (!draft) return res.status(404).json({ message: 'Draft not found' });
        if (draft.status !== 'PENDING') return res.status(400).json({ message: 'Draft not pending' });

        if (draft.type === 'NEW_HERO') {
            // Create new hero
            // Payload contains full details.
            // Add isPublished: true (or false if we want another step, but user implied "up to db")
            // For now, let's assume we create it normally.
            const heroData = { ...draft.payload, isPublished: true };
            delete heroData._id; // Ensure no ID collision if any

            const newHero = new Hero(heroData);
            await newHero.save();

            draft.status = 'APPROVED';
            draft.processedAt = new Date();
            await draft.save();

            return res.json({ success: true, message: 'Hero approved and created', hero: newHero });

        } else if (draft.type === 'NEW_SKIN') {
            // Add skin to existing hero
            const hero = await Hero.findOne({ name: draft.targetHeroName });
            if (!hero) {
                return res.status(404).json({ message: `Target hero ${draft.targetHeroName} not found` });
            }

            // Deduplicate check
            const exists = hero.skins.some(s => s.name === draft.payload.name);
            if (!exists) {
                // Upload image to Cloudinary before saving to DB
                if (draft.payload.image) {
                    try {
                        const safeSkinName = draft.payload.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const safeHeroName = hero.slug || hero.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const publicId = `${safeHeroName}-${safeSkinName}`;
                        
                        console.log(`[DraftApproval] Uploading skin image for ${draft.payload.name}...`);
                        const cloudUrl = await uploadImageFromUrl(draft.payload.image, 'BlogHok/heroes/skins_splash', publicId);
                        
                        if (cloudUrl) {
                            draft.payload.image = cloudUrl;
                        } else {
                            console.warn(`[DraftApproval] Failed to upload image for ${draft.payload.name}, using original URL.`);
                        }
                    } catch (uploadErr) {
                        console.error(`[DraftApproval] Error uploading skin image: ${uploadErr.message}`);
                    }
                }

                hero.skins.push(draft.payload);
                await hero.save();
            }

            draft.status = 'APPROVED';
            draft.processedAt = new Date();
            await draft.save();

            return res.json({ success: true, message: 'Skin approved and added' });
        }

        res.status(400).json({ message: 'Unknown draft type' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/drafts/:id/reject - Reject a draft
router.post('/:id/reject', async (req, res) => {
    try {
        const draft = await DraftChange.findById(req.params.id);
        if (!draft) return res.status(404).json({ message: 'Draft not found' });

        draft.status = 'REJECTED';
        draft.processedAt = new Date();
        await draft.save();

        res.json({ success: true, message: 'Draft rejected' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
