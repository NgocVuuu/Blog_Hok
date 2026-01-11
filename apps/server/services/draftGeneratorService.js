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

            // 2. Generate "Counter Guide"
            const counterGuide = await this.generateCounterGuide();
            if (counterGuide) {
                await News.create(counterGuide);
                results.draftsCreated++;
                results.titles.push(counterGuide.title);
                this.logger.info(`[DraftGenerator] Created Draft: ${counterGuide.title}`);
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

## 🏆 The Tier List: Kings & Queens of Each Lane
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
## 🚫 Banned & Dangerous
These heroes are currently considered the biggest threats, leading to massive Ban Rates. If they slip through the ban phase, pick them immediately!
`;
        byBanRate.slice(0, 5).forEach(h => {
            content += `- **${h.name}** - Ban Rate: ${h.banRate}%\n`;
        });

        // Trending
        content += `
## 📈 Rising Stars (Most Picked)
The most popular picks in the current meta:
`;
        byPickRate.slice(0, 5).forEach(h => {
            content += `- **${h.name}** - Pick Rate: ${h.pickRate}%\n`;
        });

        content += `
---
*Data Snapshot: ${dateStr}. Source: Official Global Ranked Statistics.*
`;

        return {
            title: `Weekly Meta Report [${dateStr}]: The Complete Breakdown`,
            content: content,
            summary: `Comprehensive analysis of Week ${weekNumber} meta: Top Win Rate heroes by lane, Most Banned threats, and Rising Stars.`,
            status: 'draft',
            category: 'esports', // or guides
            image: byWinRate[0]?.image || '', // Access image of top hero
            keywords: 'Honor of Kings Meta, Tier List, Win Rate, Ranked Guide'
        };
    }

    // --- DRAFT 2: COUNTER GUIDE ---
    async generateCounterGuide(targetHero = null) {
        if (!targetHero) {
            // Logic: Find a High Ban Rate hero (Top 10) to write a guide about
            const heroes = await Hero.find({}).sort({ banRate: -1 }).limit(10).lean();
            if (!heroes.length) return null;
            // Pick random from top 10 to vary content
            targetHero = heroes[Math.floor(Math.random() * heroes.length)];
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

        let content = `
Is **${targetHero.name}** ruining your ranked games? With a Ban Rate of ${targetHero.banRate}%, you are not alone.

In this guide, we break down exactly how to shut down ${targetHero.name} using strategies that work.

## 🛡️ Best Counter Picks
`;

        if (!isGeneric && counters.length > 0) {
            content += `According to official match data, these heroes have the highest advantage against ${targetHero.name}:\n`;
            for (const counter of counters) {
                const cName = counter.heroName || `Hero ID ${counter.heroId}`;
                content += `- **${cName}**: Natural counter due to kit advantage.\n`;
            }
        } else {
            // Generic Assassin Counters
            content += `While specific matchup data is updating, these classes of heroes generally counter ${targetHero.name}:\n`;
            content += `- **Hard CC Supports**: Heroes like **Donghuang** or **Aleister** can lock them down instantly.\n`;
            content += `- **Tanky Warriors**: Heroes who can survive the initial burst (e.g., **Arthur**, **Xiahou Dun**) and retaliate.\n`;
            content += `- **Vision Providers**: Heroes like **Shouyue** or **Li Yuanfang** prevent them from sneaking up.\n`;
        }

        if (!isGeneric && victims.length > 0) {
            content += `\n## ⚠️ Danger Zone: Do NOT Pick These\n${targetHero.name} historically destroys these heroes. Avoid playing them into this matchup:\n`;
            for (const v of victims) {
                content += `- **${v.heroName}**\n`;
            }
        } else {
            content += `\n## ⚠️ Danger Zone: Squishy Heroes\nAs an Assassin, ${targetHero.name} preys on low-mobility marksmen and mages. Avoid picking heroes without escape skills if you don't have strong peel.\n`;
        }

        content += `
## 💡 Gameplay Tips
- **Early Game**: ${targetHero.name} often looks for ganks at level 4. Play safe when they are missing from the map.
- **Teamfights**: Save your Crowd Control skills specifically for when they dive in.
- **Items**: 
  - **Mages**: Build **Splendor** (Stasis) to survive the burst.
  - **Marksmen**: Consider **Sage's Sanctuary** or a defensive armor item.
  - **Tanks**: Build items that slow attack speed or reflect damage.
`;

        return {
            title: `Counter Guide: How to Shut Down ${targetHero.name}`,
            content: content,
            summary: `Struggling against ${targetHero.name}? Discover the best counters, gameplay tips, and strategy to survive the burst and win the game.`,
            status: 'draft',
            category: 'guides',
            image: targetHero.image || '',
            keywords: `Counter ${targetHero.name}, ${targetHero.name} Guide, HoK Strategy, Anti-Assassin`
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
