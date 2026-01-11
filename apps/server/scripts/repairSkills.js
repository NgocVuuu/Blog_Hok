#!/usr/bin/env node
/**
 * Repair Script: Fix Missing Skills
 * Iterates all heroes, checks if skills are missing or broken, and re-syncs them.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load env
const serverEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: serverEnvPath });

const { connectDB } = require('../config/db');
const Hero = require('../models/Hero');
const { syncHoKMeta } = require('../services/syncHoKMetaService');

async function run() {
    console.log('\n========================================');
    console.log('REPAIR: HERO SKILLS');
    console.log('========================================\n');

    try {
        await connectDB();

        // Find broken heroes
        const heroes = await Hero.find({}).lean();
        const brokenHeroes = heroes.filter(h => {
            if (!h.skills || h.skills.length === 0) return true;
            // Check for missing names
            return h.skills.some(s => !s.name || s.name.trim() === '');
        });

        console.log(`[Repair] Found ${brokenHeroes.length} heroes with missing/broken skills.`);

        if (brokenHeroes.length === 0) {
            console.log('[Repair] All heroes seem healthy! Exiting.');
            process.exit(0);
        }

        const targetList = brokenHeroes.map(h => ({
            heroId: h.officialId || h.id || (h.officialInfo ? h.officialInfo.heroId : null), // We need a way to ID them for the fetcher
            name: h.name,
            cname: h.name // sync service usually uses name or cname
        }));

        // We can pass `directData` to syncHoKMeta to limit scope?
        // Actually, syncHoKMeta usually fetches list.
        // But we can just run for ALL with scopes=['skills']?
        // But that's heavy.

        // Better: Run syncHoKMeta with `scopes: ['skills']` and `healForce: true`.
        // It will iterate all heroes in memory (which matches DB + Official).
        // And update skills.

        // Wait, if I supply `directData`, syncHoKMeta uses it.
        // Let's construct `directData` from our broken list, but `heroId` must be correct.
        // The `Hero` model doesn't always store `officialId` explicitly at top level?
        // Let's check Schema... assume `officialInfo` or `id` might be there?
        // Safest is to just run a full sync for SKILLS ONLY. It handles matching.

        console.log(`[Repair] Starting repair for ALL heroes (Scope: skills)...`);

        // Custom logger
        const logger = {
            info: (msg) => console.log(msg),
            warn: (msg) => console.warn(msg),
            error: (msg) => console.error(msg)
        };

        // Note: We do NOT pass directData, so it will fetch the official ranklist first.
        // This is fine. It ensures we have fresher IDs.

        // Use fetchAndSync from auto fetcher to handle the fetch step?
        // Or call syncHoKMeta directly if we trust it fetches static/API?
        // syncHoKMeta requires `directData` OR `staticFile`. It throws if neither for API?
        // No, it handles it? Let's check syncHoKMetaService line 578: "No hero stats data available" error.

        // So we must fetch ranklist first.
        const { fetchHeroStats } = require('../services/hokAutoFetcher');
        // Increase timeout to 60s
        const fetchRes = await fetchHeroStats({ logger, saveToFile: false, timeout: 60000 });

        if (!fetchRes.success) throw new Error("Failed to fetch ranklist");

        // Filter ranklist to only broken heroes?
        // To speed it up:
        const brokenNames = new Set(brokenHeroes.map(h => h.name.toLowerCase()));
        console.log('[Repair] Broken Heroes:', brokenHeroes.map(h => h.name).join(', '));

        const officialNames = fetchRes.data.data.list.map(h => {
            return (h.cname || h.heroName || h.heroInfo?.heroName || '').toLowerCase();
        });
        console.log('[Repair] First Official Name (debug):', officialNames[0]);

        brokenHeroes.forEach(bh => {
            const bName = (bh.name || '').toLowerCase();
            const candidates = officialNames.filter(on => on && (on.includes(bName) || bName.includes(on)));
            // console.log(`[Repair] Match Candidates for '${bh.name}':`, candidates.join(', '));
        });

        const filteredList = fetchRes.data.data.list.filter(h => {
            // Loose matching for repair
            const n = (h.cname || h.heroName || h.heroInfo?.heroName || '').toLowerCase();
            if (!n) return false;

            return brokenHeroes.some(bh => {
                const bName = (bh.name || '').toLowerCase();
                return n === bName || n.includes(bName) || bName.includes(n) ||
                    (bName === 'lady zhen' && n === 'chicha') ||
                    (bName === 'mai shiranui' && n === 'mai') ||
                    (bName === 'augran' && n === 'augran'); // explicit check
            });
        });

        console.log(`[Repair] Matched ${filteredList.length}/${brokenHeroes.length} broken heroes in official list.`);
        console.log(`[Repair] Repairing: ${filteredList.map(h => h.cname).join(', ')}`);

        await syncHoKMeta({
            scopes: ['skills'], // ONLY SKILLS
            healForce: true,    // FORCE UPDATE even if exists
            directData: filteredList, // Only process these
            logger: logger
        });

        console.log('\n✅ Repair Completed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Repair Failed:', error.message);
        process.exit(1);
    }
}

run();
