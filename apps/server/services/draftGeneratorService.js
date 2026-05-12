const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const HeroRaw = require('../models/HeroRaw');
const News = require('../models/News');

/**
 * Service to generate automated draft articles
 */
class DraftGeneratorService {
    constructor(logger = console) {
        this.logger = logger;
    }

    async generateWeeklyDrafts() {
        this.logger.info('[DraftGenerator] Starting weekly draft generation...');
        const results = { draftsCreated: 0, titles: [] };

        try {
            // 1. Generate "Weekly Meta Report"
            const metaReport = await this.generateMetaReport();
            if (metaReport) {
                await News.create(metaReport);
                results.draftsCreated++;
                results.titles.push(metaReport.title);
                this.logger.info(`[DraftGenerator] Created Draft: ${metaReport.title}`);
            }

            // 2. Generate "Counter Guide" (5 Drafts)
            // Strategy: 
            // - 5 articles per week
            // - Avoid heroes covered in the last 3 months
            // - Prioritize hot heroes (High Ban Rate)
            
            // A. Build Exclusion List (Heroes covered in last 3 months)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const recentGuides = await News.find({
                category: 'guides',
                createdAt: { $gte: threeMonthsAgo },
                title: { $regex: /Counter/i }
            }).select('title').lean();

            const allHeroes = await Hero.find({}, 'name_id name').lean();
            const excludedSet = new Set();
            
            // Map recent titles to hero IDs
            for (const guide of recentGuides) {
                // Simple check: does title contain hero name?
                // This might be fuzzy but sufficient for "How to Counter [Hero]" format
                const matchedHero = allHeroes.find(h => guide.title.includes(h.name));
                if (matchedHero) {
                    excludedSet.add(matchedHero._id.toString());
                }
            }
            
            this.logger.info(`[DraftGenerator] Excluding ${excludedSet.size} heroes covered in last 3 months.`);

            // B. Generate 5 Counter Drafts
            const thisWeekCounterIds = new Set();

            for (let i = 0; i < 5; i++) {
                // Combine historical exclusion + current week exclusion
                const currentExclusion = new Set([...excludedSet, ...thisWeekCounterIds]);
                
                const counterGuide = await this.generateCounterGuide(null, currentExclusion);
                if (counterGuide) {
                    await News.create(counterGuide.article);
                    // Add hero ID to used set to prevent duplicate drafts
                    if(counterGuide.heroId) thisWeekCounterIds.add(counterGuide.heroId.toString());

                    results.draftsCreated++;
                    results.titles.push(counterGuide.article.title);
                    this.logger.info(`[DraftGenerator] Created Counter Draft: ${counterGuide.article.title}`);
                }
            }

            // 3. Generate "To Pro" Guides (5 Drafts)
            // Goal: Guide players to master the hero.
            // Strategy: 5 articles/week, similar selection logic (hot heroes), avoid recent Pro guides.
            
            // A. Build Exclusion List for Pro Guides
            const recentProGuides = await News.find({
                category: 'guides',
                createdAt: { $gte: threeMonthsAgo },
                title: { $regex: /Mastering|Ultimate Guide/i } // Patterns specific to Pro Guides
            }).select('title').lean();

            const excludedProSet = new Set();
             for (const guide of recentProGuides) {
                const matchedHero = allHeroes.find(h => guide.title.includes(h.name));
                if (matchedHero) excludedProSet.add(matchedHero._id.toString());
            }

            // B. Generate 5 Pro Drafts
            const thisWeekProIds = new Set();
             // We can allow overlap between Counter and Pro guides in the same week, 
             // but let's try to diversify if possible. 
             // Ideally: Don't write 'Counter Chicha' and 'Mastering Chicha' in the same week unless Chicha is SUPER hot.
             // For simplicity, let's just avoid duplication within the 'Pro' set.
            
            for (let i = 0; i < 5; i++) {
                 // Combine historical + current week exclusion
                 // Also optionally exclude heroes selected for Counter guides this week to ensure variety?
                 // Let's keep them separate for now.
                const currentExclusion = new Set([...excludedProSet, ...thisWeekProIds]);

                const proGuide = await this.generateProGuide(null, currentExclusion);
                if (proGuide) {
                    await News.create(proGuide.article);
                    if(proGuide.heroId) thisWeekProIds.add(proGuide.heroId.toString());

                    results.draftsCreated++;
                    results.titles.push(proGuide.article.title);
                    this.logger.info(`[DraftGenerator] Created Pro Draft: ${proGuide.article.title}`);
                }

            }

        } catch (error) {
            this.logger.error(`[DraftGenerator] Error generating drafts: ${error.message}`);
        }

        return results;
    }

    // --- DRAFT 1: META REPORT ---
    async generateMetaReport() {
        const today = new Date();
        const weekNumber = this.getWeekNumber(today);
        const dateStr = today.toLocaleDateString('en-GB'); // DD/MM/YYYY

        // Fetch Data
        const heroes = await Hero.find({}).lean();

        // Sorts
        const byWinRate = [...heroes].sort((a, b) => (b.winRate || 0) - (a.winRate || 0));
        const byBanRate = [...heroes].sort((a, b) => (b.banRate || 0) - (a.banRate || 0));
        const byPickRate = [...heroes].sort((a, b) => (b.pickRate || 0) - (a.pickRate || 0));

        // Group by Lane (Top 3 per lane)
        const lanes = ['Mid', 'Clash', 'Farm', 'Jungle', 'Roam'];
        const laneStats = {};

        lanes.forEach(lane => {
            // Map 'Clash' to 'Clash Lane' data if needed, but usually 'lanes' array contains standard strings
            // We do a loose include check
            const laneHeroes = byWinRate.filter(h =>
                h.lanes && h.lanes.some(l => l.toLowerCase().includes(lane.toLowerCase()))
            );
            laneStats[lane] = laneHeroes.slice(0, 3);
        });

        // Generate HTML Content
        // Generate Markdown Content
        let content = `
Welcome to the **Weekly Meta Report** for Week ${weekNumber} (${dateStr}). Here is your complete breakdown of the current state of ranked matches in Honor of Kings.

## The Tier List: Kings & Queens of Each Lane
Based on Global Ranked Data (Win Rate > 50%), here are the dominant forces you should be playing right now.
`;

        // Lane Tables
        for (const lane of lanes) {
            content += `\n### ${lane} Lane Dominators\n`;
            if (laneStats[lane] && laneStats[lane].length > 0) {
                laneStats[lane].forEach((h, idx) => {
                    content += `- **#${idx + 1} ${h.name}** - Win Rate: ${h.winRate}% (Tier: ${h.tier || 'A'})\n`;
                });
            } else {
                content += `No data available for this lane.\n`;
            }
        }

        // Dangerous & Banned
        content += `
## Banned & Dangerous
These heroes are currently considered the biggest threats, leading to massive Ban Rates. If they slip through the ban phase, pick them immediately!
`;
        byBanRate.slice(0, 5).forEach(h => {
            content += `- **${h.name}** - Ban Rate: ${h.banRate}%\n`;
        });

        // Trending
        content += `
## Rising Stars (Most Picked)
The most popular picks in the current meta:
`;
        byPickRate.slice(0, 5).forEach(h => {
            content += `- **${h.name}** - Pick Rate: ${h.pickRate}%\n`;
        });

        content += `
---
*Data Snapshot: ${dateStr}. Source: BLOGHOK.*
`;

        return {
            title: `Weekly Meta Report [${dateStr}]: The Complete Breakdown`,
            content: content,
            summary: `Comprehensive analysis of Week ${weekNumber} meta: Top Win Rate heroes by lane, Most Banned threats, and Rising Stars.`,
            status: 'published',
            category: 'updates',
            image: 'https://res.cloudinary.com/dt0t1ayoq/image/upload/v1769958473/BlogHok/tkldlpcwja6khzkfi86r.jpg',
            keywords: 'Honor of Kings Meta, Tier List, Win Rate, Ranked Guide'
        };
    }

    // --- DRAFT 2: COUNTER GUIDE ---
    async generateCounterGuide(targetHero = null, excludeHeroIds = new Set()) {
        if (!targetHero) {
            // Logic: Find a High Ban Rate hero (Top 60) to write a guide about
            // Increased limit to 60 to ensure we have enough candidates even with 3-month exclusion
            const heroes = await Hero.find({}).sort({ banRate: -1 }).limit(60).lean();
            if (!heroes.length) return null;

            // Filter out already used heroes
            const availableHeroes = heroes.filter(h => !excludeHeroIds.has(h._id.toString()));
            // Check if we ran out of candidates due to exclusion
            if (!availableHeroes.length) {
                // FALLBACK: If all Top 60 are excluded (recently covered), 
                // we ignore the exclusion list and pick the hottest hero (Top 1) again.
                // This satisfies "nếu ngoài 3 tháng mà tướng đó vẫn hot thì vẫn viết" (if still hot, write it)
                // but since we filtered ALL top 60, it implies we covered them all recently.
                // However, technically if they are in Top 60 but excluded, it means we covered them in last 3 months.
                // If we truly have NO candidates left in Top 60, we might need to expand or just pick a random popular one from Top  10 despite duplicates.
                // But let's assume Top 60 is large enough. If empty, pick Top 5 ignoring exclusion.
                
                this.logger.warn('[DraftGenerator] All Top 60 candidates excluded. Falling back to Top 5 ignoring history.');
                const top5 = heroes.slice(0, 5);
                targetHero = top5[Math.floor(Math.random() * top5.length)];
            } else {
                // Pick random from available top heroes
                targetHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
            }
        }

        let counters = [];
        let victims = [];
        let isGeneric = false;

        // Try to fetch specific strategy data
        const heroRaw = await HeroRaw.findOne({ hero: targetHero._id }).lean();

        if (heroRaw && heroRaw.strategyData && heroRaw.strategyData.minus) {
            counters = heroRaw.strategyData.minus.slice(0, 3);
            victims = heroRaw.strategyData.suppress ? heroRaw.strategyData.suppress.slice(0, 3) : [];
        } else {
            // Fallback for heroes without specific API data
            isGeneric = true;
            this.logger.info(`[DraftGenerator] Using generic counters for ${targetHero.name}`);
        }

        const today = new Date();
        const monthYear = today.toLocaleString('en-US', { month: 'long', year: 'numeric' }); // e.g. "February 2026"

        let content = `
Is **${targetHero.name}** absolutely destroying your Ranked matches? You aren't alone. With a rising Ban Rate of ${targetHero.banRate || 'high'}%, this hero has become the nightmare of squishy heroes everywhere.

One moment you’re farming lane, and the next—POOF—screen turns gray. But here’s the good news: **${targetHero.name}** is not invincible. If you understand their kit and how to punish their cooldowns, you can turn this terrifying predator into a harmless minion.

In this guide, we break down exactly how to shut down ${targetHero.name} using current ${monthYear} meta strategies that actually work.

## The "Anti-${targetHero.name}" Counter List
The best way to win is to win the draft. ${targetHero.name} struggles heavily against three specific types of heroes: **Hard CC**, **Beefy Tanks**, and **True Sight**.

Here is your cheat sheet for the draft phase:
`;

        if (!isGeneric && counters.length > 0) {
            content += `\n| Counter Type | Recommended Heroes | Why It Works |\n|---|---|---|\n`;
            // Dynamic generation from data
             counters.forEach(c => {
                 content += `| **Matchup Advantage** | **${c.heroName}** | Statistically proven to win against ${targetHero.name} in current meta. |\n`;
             });
             // Add logic generic fillers if not enough data
             content += `| **Hard CC** | **Donghuang, Liang** | ${targetHero.name} relies on mobility. Press Ult = ${targetHero.name} dies. |\n`;

        } else {
            // Generic Assassin Counters Table
            content += `
| Counter Type | Recommended Heroes | Why It Works |
|---|---|---|
| **Hard CC Supports** | **Donghuang, Liang** | ${targetHero.name} relies on mobility. These heroes have "Suppression" ultimates that lock enemies down instantly. You press Ult = ${targetHero.name} dies. |
| **Tanky Warriors** | **Arthur, Dun** | These heroes can tank ${targetHero.name}’s full combo without dying. Once ${targetHero.name} runs out of skills, these warriors can easily retaliate. |
| **Vision Providers** | **Shouyue, Fang** | ${targetHero.name} needs the element of surprise. Shouyue’s eyes and Yuanfang’s passive reveal invisible threats, ruining flank angles. |
`;
        }

        if (!isGeneric && victims.length > 0) {
            content += `
## The Danger Zone: Who NOT to Pick
If you see the enemy lock in ${targetHero.name}, do not blind pick these heroes. ${targetHero.name} historically destroys them:
`;
            for (const v of victims) {
                content += `- **${v.heroName}**\n`;
            }
             content += `\n**The Rule:** If you don't have a dash or Flash is on cooldown, you are just a walking gold bag for ${targetHero.name}.\n`;

        } else {
             content += `
## The Danger Zone: Who NOT to Pick
If you see the enemy lock in ${targetHero.name}, do not blind pick low-mobility heroes. ${targetHero.name} feasts on targets who cannot jump over walls or dash away.

**Avoid:** Immobile Mages (like **Diaochan** without passive up) or ADCs without self-peel (like **Hou Yi** without support).

**The Rule:** If you don't have a dash or Flash is on cooldown, you are just a walking gold bag for ${targetHero.name}.
`;
        }
        
        // Gameplay Section
        content += `
## Gameplay & Macro: How to Survive
Picking the right hero is only 50% of the battle. You need to play smart.

**1. Respect the Level 4 Power Spike**
${targetHero.name} is often weakest at Level 1-3. However, once they hit Level 4, they will look for a gank immediately.
*   **The Play:** If the enemy Jungler is missing and you are overextended, retreat to your tower. Do not greed for that extra minion wave.

**2. The "Patience" Game in Teamfights**
If you are a Support or Mage with CC, do not waste your stun on the enemy Tank.
*   **The Play:** Hold your skill. Wait. Watch the map. The second ${targetHero.name} dives your Marksman, unload everything on them. ${targetHero.name} is usually squishy; one stun usually equals a kill.

## Itemization: Build to Survive
Stop building full damage if you are 0/3! Adjusting your build is the difference between a loss and a comeback.

*   **For Mages:** Rush **Splendor (Stasis)**. When ${targetHero.name} jumps on you, pop the active. You become invincible, ${targetHero.name} wastes their combo, and your team cleans up.
*   **For Marksmen:** Late game, buy **Sage's Sanctuary (Revive)** or a pure defensive item like **Ominous Premonition**. Dead DPS deals zero damage.
*   **For Tanks:** Prioritize items that slow attack speed or reflect damage (like **Spikemail**). Make ${targetHero.name} regret touching you.

## Summary
${targetHero.name} is a "noob stomper." They punish mistakes, bad positioning, and greedy builds. Play disciplined, draft heavy CC, and buy defensive items. You'll watch their win rate plummet.

👇 **Which hero is giving you the most trouble in the current Season? Comment below and I'll write a guide on how to counter them next!**
`;

        return {
            article: {
                title: `How to Counter ${targetHero.name} [${monthYear}]: Stop the "Rank Slayer" from Ruining Your Games`,
                content: content,
                summary: `Struggling against ${targetHero.name}? Discover the best counters, gameplay tips, and strategy to survive the burst and win the game. Updated for ${monthYear}.`,
                status: 'draft',
                category: 'guides',
                image: targetHero.image || '',
                keywords: `Counter ${targetHero.name}, ${targetHero.name} Guide, HoK Strategy, Anti-Assassin, ${monthYear} Guide`
            },
            heroId: targetHero._id
        };
    }

    // --- DRAFT 3: PRO GUIDE (TO PRO) ---
    async generateProGuide(targetHero = null, excludeHeroIds = new Set()) {
        if (!targetHero) {
            // Logic: Pick POPULAR heroes (High Pick Rate or Ban Rate) to teach people how to play
            // Top 60 logic similar to Counter Guide
            const heroes = await Hero.find({}).sort({ pickRate: -1 }).limit(60).lean();
            if (!heroes.length) return null;

            const availableHeroes = heroes.filter(h => !excludeHeroIds.has(h._id.toString()));
            
            if (!availableHeroes.length) {
                // Fallback: Pick top 5 ignoring exclusion
                const top5 = heroes.slice(0, 5);
                targetHero = top5[Math.floor(Math.random() * top5.length)];
            } else {
                targetHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
            }
        }

        const today = new Date();
        const monthYear = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        // Content Generation
        let content = `
Want to carry your games 1v9? **${targetHero.name}** is the answer.

Currently tearing up the Ranked ladders with a massive ${targetHero.winRate || 'high'}% Win Rate, this hero is the definition of "Easy to Learn, Hard to Master." But once you master them, you become unstoppable.

This is not just another basic guide. This is the **"To Pro" Masterclass**: Everything you need to know to play ${targetHero.name} like a Grandmaster in ${monthYear}.

## Why Play ${targetHero.name}?
*   **Strengths:** High burst damage, game-changing ultimate, and excellent teamfight presence.
*   **The "X-Factor":** Unlike other heroes, ${targetHero.name} can turn a losing 2v5 fight into a winning Triple Kill if played correctly.

## The Cheat Sheet: Build, Arcana & Spells
Forget the recommended builds. Here is what the top 1% of players are using right now.

| Category | Recommended Setup | Pro Notes |
|---|---|---|
| **Core Items** | **Boots of Resistance, Doomsday, Daybreaker** | Rushing attack speed early lets you dominate lane phase. |
| **Situational** | **Magistrate (Late Game)** | Swap boots for this if the game goes past 18 minutes. |
| **Arcana** | **10x Hunt, 10x Eagle Eye, 10x Calamity** | Maximizes raw penetration and movement speed. |
| **Summoner Spell** | **Flash (Flicker)** | Essential for the "Flash-Ult" combo. |

## Essential Combos & Mechanics

**1. The Basic Trade (Poke)**
> Skill 1 -> Auto Attack -> Skill 2 -> Retreat
*   **Tip:** Always weave an Auto Attack between skills to maximize damage output.

**2. The One-Shot Combo (All-In)**
> Skill 3 (Ult) -> Flash -> Skill 2 -> Skill 1 -> Auto Attack
*   **Execution:** Use Flash *during* the Ultimate animation to catch enemies off guard. This is impossible to react to if done fast.

## Macro Strategy: How to Win

**Early Game (0:00 - 5:00)**
Your goal is simple: **Farm**. Do not rotate unless you have pushed your wave into the enemy tower. ${targetHero.name} needs items to come online.
*   **Pro Tip:** If you see the enemy Jungler top, play aggressive. If they are missing, hug your tower.

**Mid Game (5:00 - 12:00)**
This is your time to shine. Look for skirmishes around the Dragon/Overlord.
*   **Pro Tip:** Do not start the fight. Wait for the enemy tank to engage, then dive the backline.

**Late Game (12:00+)**
You are the carry. If you die, the game is over. Position behind your tank and hit the closest target.
*   **Pro Tip:** Save your defensive cooldowns for the enemy Assassin.

## Summary
Mastering ${targetHero.name} takes patience, but the rewards are massive MMR gains. Stick to the build, practice the combos in training mode, and remember: **Positioning is everything.**

Good luck on the battlefield!

👇 **Have a secret build for ${targetHero.name}? Share it in the comments below!**
`;

        return {
            article: {
                title: `Mastering ${targetHero.name}: The Ultimate Guide to Carry Games [${monthYear}]`,
                content: content,
                summary: `Stop feeding and start carrying. The complete "To Pro" guide for ${targetHero.name}: Pro Builds, Button Combos, and Macro Strategy for ${monthYear}.`,
                status: 'draft',
                category: 'guides',
                image: targetHero.image || '',
                keywords: `${targetHero.name} Guide, How to play ${targetHero.name}, HoK Pro Build, ${targetHero.name} Combo`
            },
            heroId: targetHero._id
        };
    }

    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }
}

module.exports = { DraftGeneratorService };
