const express = require('express');
const router = express.Router();
const Hero = require('../models/Hero');
const Equipment = require('../models/Equipment');
const Arcana = require('../models/Arcana');
const User = require('../models/User');

// Helper to normalize string for comparison
const normalize = (str) => str ? str.trim().toLowerCase() : '';

// Helper for Levenshtein distance
const levenshtein = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

// GET /api/data-checks/summary
router.get('/summary', async (req, res) => {
    try {
        const issues = {
            duplicateSkins: [],
            duplicateEquipment: [],
            similarSkins: [], // New category
            similarEquipment: [], // New category
            missingSkinImages: [],
            missingHeroImages: [],
            security: [] // New Security category
        };

        // 1. Check Heroes Logic
        const heroes = await Hero.find({}).lean();
        
        heroes.forEach(hero => {
            // Check for duplicate skins within the same hero
            const skinNames = new Map();
            const skinList = []; // For similarity check

            if (hero.skins && Array.isArray(hero.skins)) {
                hero.skins.forEach((skin, index) => {
                    const normName = normalize(skin.name);
                    
                    // Exact Duplicate Check
                    if (skinNames.has(normName)) {
                        issues.duplicateSkins.push({
                            heroId: hero._id,
                            heroName: hero.name,
                            skinName: skin.name,
                            index: index,
                            originalIndex: skinNames.get(normName)
                        });
                    } else {
                        skinNames.set(normName, index);
                    }

                    // Similarity Check
                    // Compare with all previous skins
                    for (const prevSkin of skinList) {
                        const dist = levenshtein(normName, prevSkin.normName);
                        // Threshold: Distance <= 2 AND length > 3 (to avoid short acronyms)
                        if (dist > 0 && dist <= 2 && normName.length > 3) {
                            issues.similarSkins.push({
                                heroId: hero._id,
                                heroName: hero.name,
                                skin1: prevSkin.name,
                                skin2: skin.name,
                                distance: dist
                            });
                        }
                    }
                    skinList.push({ name: skin.name, normName, index });

                    // Check for missing images
                    if (!skin.image || skin.image.trim() === '') {
                        issues.missingSkinImages.push({
                            heroId: hero._id,
                            heroName: hero.name,
                            skinName: skin.name
                        });
                    }
                });
            }

            // Check for missing hero main image
            if (!hero.image || hero.image.trim() === '') {
                issues.missingHeroImages.push({
                    heroId: hero._id,
                    heroName: hero.name,
                    type: 'Avatar'
                });
            }
        });

        // 2. Check Equipment Logic
        const equipments = await Equipment.find({}).lean();
        const equipmentNames = new Map();
        const equipmentList = [];

        equipments.forEach(eq => {
            const normName = normalize(eq.name);
            
            // Exact Duplicate Check
            if (equipmentNames.has(normName)) {
                issues.duplicateEquipment.push({
                    originalId: equipmentNames.get(normName)._id,
                    duplicateId: eq._id,
                    name: eq.name
                });
            } else {
                equipmentNames.set(normName, eq);
            }

            // Similarity Check
            for (const prevEq of equipmentList) {
                const dist = levenshtein(normName, prevEq.normName);
                if (dist > 0 && dist <= 2 && normName.length > 3) {
                    issues.similarEquipment.push({
                        id1: prevEq.id,
                        name1: prevEq.name,
                        id2: eq._id,
                        name2: eq.name,
                        distance: dist
                    });
                }
            }
            equipmentList.push({ id: eq._id, name: eq.name, normName });
        });

        // 3. Security & Config Check
        // Environment Check
        if (process.env.NODE_ENV !== 'production') {
            issues.security.push({
                severity: 'info',
                type: 'Environment',
                message: `Server running in '${process.env.NODE_ENV}' mode.`
            });
        }

        // Secret Strength Check
        const secret = process.env.JWT_SECRET || '';
        if (secret.length < 32) {
            issues.security.push({
                severity: 'high',
                type: 'Configuration',
                message: 'JWT_SECRET is weak (< 32 chars). Tokens may be vulnerable.'
            });
        }

        // Admin Accounts Check
        const admins = await User.find({ role: 'admin' }).select('email name authType createdAt');
        
        if (admins.length > 5) {
            issues.security.push({
                severity: 'warning',
                type: 'Accounts',
                message: `Too many Admin accounts detected (${admins.length}). Review access rights.`
            });
        }

        admins.forEach(adm => {
            const email = adm.email.toLowerCase();
            if (email.includes('admin') || email.includes('root') || email.includes('test')) {
                issues.security.push({
                    severity: 'medium',
                    type: 'Account Risk',
                    message: `Admin email '${adm.email}' is easily guessable.`
                });
            }
        });

        res.json({ success: true, data: issues });

    } catch (err) {
        console.error('Data check error:', err);
        res.status(500).json({ success: false, message: 'Failed to run data checks' });
    }
});

module.exports = router;
