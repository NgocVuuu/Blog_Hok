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
        let content = `
      <p>Welcome to the <strong>Weekly Meta Report</strong> for Week ${weekNumber} (${dateStr}). Here is your complete breakdown of the current state of ranked matches in Honor of Kings.</p>
      
      <h2>🏆 The Tier List: Kings & Queens of Each Lane</h2>
      <p>Based on Global Ranked Data (Win Rate > 50%), here are the dominant forces you should be playing right now.</p>
    `;

        // Lane Tables
        for (const lane of lanes) {
            content += `<h3>${lane} Lane Dominators</h3>`;
            if (laneStats[lane] && laneStats[lane].length > 0) {
                content += `<ul>`;
                laneStats[lane].forEach((h, idx) => {
                    content += `
            <li>
              <strong>#${idx + 1} ${h.name}</strong> - Win Rate: <span style="color:green">${h.winRate}%</span> 
              (Tier: ${h.tier || 'A'})
            </li>`;
                });
                content += `</ul>`;
            } else {
                content += `<p>No data available for this lane.</p>`;
            }
        }

        // Dangerous & Banned
        content += `
      <h2>🚫 Banned & Dangerous</h2>
      <p>These heroes are currently considered the biggest threats, leading to massive Ban Rates. If they slip through the ban phase, pick them immediately!</p>
      <ul>
    `;
        byBanRate.slice(0, 5).forEach(h => {
            content += `<li><strong>${h.name}</strong> - Ban Rate: <span style="color:red">${h.banRate}%</span></li>`;
        });
        content += `</ul>`;

        // Trending
        content += `
      <h2>📈 Rising Stars (Most Picked)</h2>
      <p>The most popular picks in the current meta:</p>
      <ul>
    `;
        byPickRate.slice(0, 5).forEach(h => {
            content += `<li><strong>${h.name}</strong> - Pick Rate: <span style="color:blue">${h.pickRate}%</span></li>`;
        });
        content += `</ul>`;

        content += `
      <hr />
      <p><em>Data Snapshot: ${dateStr}. Source: Official Global Ranked Statistics.</em></p>
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
    async generateCounterGuide() {
        // Logic: Find a High Ban Rate hero (Top 10) to write a guide about
        // Ideally one that we haven't written about recently (not implemented here, simple random pick from top)
        const heroes = await Hero.find({}).sort({ banRate: -1 }).limit(10).lean();
        if (!heroes.length) return null;

        // Pick random from top 10 to vary content
        const targetHero = heroes[Math.floor(Math.random() * heroes.length)];

        // Fetch Raw Strategy Data
        const heroRaw = await HeroRaw.findOne({ hero: targetHero._id }).lean();
        if (!heroRaw || !heroRaw.strategyData || !heroRaw.strategyData.minus) {
            this.logger.warn(`[DraftGenerator] No strategy data for ${targetHero.name}`);
            return null;
        }

        // Extract Counters (Minus relationships)
        // strategyData.minus is usually an array of { heroId, heroName, vote? }
        const counters = heroRaw.strategyData.minus.slice(0, 3); // Top 3 counters

        let content = `
      <p>Is <strong>${targetHero.name}</strong> ruining your ranked games? With a Ban Rate of ${targetHero.banRate}%, you are not alone.</p>
      <p>In this guide, we break down exactly how to shut down ${targetHero.name} using statistical counters and gameplay tips.</p>

      <h2>🛡️ Hard Counters: Who to Pick?</h2>
      <p>According to official match data, these heroes have the highest advantage against ${targetHero.name}:</p>
      <ul>
    `;

        if (counters.length > 0) {
            for (const counter of counters) {
                // Try to find counter hero details if generic name
                const cName = counter.heroName || `Hero ID ${counter.heroId}`;
                content += `<li><strong>${cName}</strong>: Natural counter due to kit advantage.</li>`;
            }
        } else {
            content += `<li><em>Data updating... Pick heroes with high Crowd Control.</em></li>`;
        }
        content += `</ul>`;

        // Suppressed By (Who target hero destroys) - Good to know when NOT to pick
        const victims = heroRaw.strategyData.suppress ? heroRaw.strategyData.suppress.slice(0, 3) : [];
        if (victims.length > 0) {
            content += `
        <h2>⚠️ Danger Zone: Do NOT Pick These</h2>
        <p>${targetHero.name} historically destroys these heroes. Avoid playing them into this matchup:</p>
        <ul>
      `;
            for (const v of victims) {
                content += `<li><strong>${v.heroName}</strong></li>`;
            }
            content += `</ul>`;
        }

        content += `
      <h2>💡 Gameplay Tips</h2>
      <ul>
        <li><strong>Early Game</strong>: respect their power spike at level 4.</li>
        <li><strong>Teamfights</strong>: Focus CC on them immediately.</li>
        <li><strong>Items</strong>: Build anti-heal or physical defense items early.</li>
      </ul>
    `;

        return {
            title: `Counter Guide: How to Shut Down ${targetHero.name}`,
            content: content,
            summary: `Struggling against ${targetHero.name}? Discover the best hard counters, gameplay tips, and strategy to win the matchup.`,
            status: 'draft',
            category: 'guides',
            image: targetHero.image || '',
            keywords: `Counter ${targetHero.name}, ${targetHero.name} Guide, HoK Strategy`
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
