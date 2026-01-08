const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Hero = require('../models/Hero');
const { uploadImageFromUrl } = require('../services/cloudinaryService');
const { HeroDetailFetcher } = require('../services/heroDetailFetcher');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const hero = await Hero.findOne({ name: 'Daji' });
        if (!hero) throw new Error('Daji not found');

        console.log('Fetching fresh Daji data...');
        const fetcher = new HeroDetailFetcher(console);
        // Daji ID 109
        const data = await fetcher.fetchOfficialData(109);
        const liquipedia = await fetcher.fetchLiquipediaData('Daji');

        // Prefer Official skills (DOM scraped), fallback to Liquipedia
        let skills = data?.skills || liquipedia?.allSkills || [];

        if (skills.length === 0) throw new Error('No skills found');

        // Patch names if needed (Official often misses names)
        if (skills === data?.skills && liquipedia?.allSkills) {
            skills = skills.map((s, i) => ({
                ...s,
                name: s.name || liquipedia.allSkills[i]?.name || `Skill ${i + 1}`
            }));
        }

        console.log('Uploading icons...');
        const finalSkills = await Promise.all(skills.map(async (s, i) => {
            let icon = s.icon;
            // Only upload if it is a http link (not data uri or existing cloudinary)
            // Actually, we want to force re-upload if it is official link to fix it
            if (icon && icon.startsWith('http')) {
                const slug = s.name ? s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `skill-${i}`;
                const publicId = `daji-skill-${slug}-${Date.now()}`;
                const up = await uploadImageFromUrl(icon, 'BlogHok/heroes/skills', publicId);
                if (up) icon = up;
            }
            return { ...s, icon };
        }));

        // Process Skill Builds (from Liquipedia)
        let skillBuilds = [];
        if (liquipedia?.skillBuilds) {
            skillBuilds = Object.entries(liquipedia.skillBuilds).map(([formName, buildSkills]) => ({
                name: formName === 'Default' ? 'Default' : formName,
                skills: buildSkills
            }));
        }

        // Map properly: Apply the Cloudinary icons to the skillBuilds
        if (skillBuilds.length > 0 && finalSkills.length > 0) {
            console.log('Mapping Cloudinary icons to SkillBuilds...');
            skillBuilds = skillBuilds.map(build => ({
                ...build,
                skills: build.skills.map(s => {
                    // Match by name
                    const match = finalSkills.find(fs =>
                        fs.name === s.name ||
                        (s.name && fs.name && s.name.toLowerCase() === fs.name.toLowerCase())
                    );
                    return {
                        ...s,
                        icon: match ? match.icon : s.icon
                    };
                })
            }));
        }

        console.log('Updating DB...');
        const res = await Hero.updateOne(
            { _id: hero._id },
            { $set: { skills: finalSkills, skillBuilds: skillBuilds } }
        );
        console.log('Update Result:', res);

        // Verify
        const updated = await Hero.findById(hero._id);
        console.log('New Skill 0 Icon:', updated.skills[0].icon);
        if (updated.skillBuilds.length > 0) {
            console.log('New Build 0 Skill 0 Icon:', updated.skillBuilds[0].skills[0].icon);
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
})();
