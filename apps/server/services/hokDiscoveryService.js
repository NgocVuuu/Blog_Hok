const { fetchHeroStats } = require('./hokAutoFetcher');
const { HeroDetailFetcher } = require('./heroDetailFetcher');
const Hero = require('../models/Hero');
const DraftChange = require('../models/DraftChange');

class HoKDiscoveryService {
    constructor(logger = console) {
        this.logger = logger;
        this.heroFetcher = new HeroDetailFetcher(logger);
    }

    /**
     * Scan for new heroes by comparing Official List vs DB
     */
    async scanForNewHeroes() {
        this.logger.info('[Discovery] Scanning for new heroes...');
        let result = { found: 0, draftsCreated: 0, errors: 0 };

        try {
            // 1. Fetch Official List
            const fetchResult = await fetchHeroStats({ logger: this.logger, saveToFile: false });
            if (!fetchResult.success || !fetchResult.data?.data?.list) {
                throw new Error('Failed to fetch official hero list');
            }

            const officialList = fetchResult.data.data.list;

            // 2. Get existing heroes from DB
            const dbHeroes = await Hero.find({}, 'name slug').lean();
            const dbHeroNames = new Set(dbHeroes.map(h => this.normalizeName(h.name)));

            // 3. Diff
            for (const item of officialList) {
                const officialName = this.normalizeName(item.cname);

                // Check if exists
                if (dbHeroNames.has(officialName)) continue;

                // Also check if pending draft exists
                const pendingDraft = await DraftChange.findOne({
                    type: 'NEW_HERO',
                    targetHeroName: item.cname,
                    status: 'PENDING'
                });

                if (pendingDraft) {
                    this.logger.info(`[Discovery] Draft already pending for ${item.cname}`);
                    continue;
                }

                this.logger.info(`[Discovery] NEW HERO DETECTED: ${item.cname} (ID: ${item.heroid})`);

                // 4. Fetch Details & Create Draft
                try {
                    const details = await this.heroFetcher.fetchOfficialData(item.heroid);
                    if (details) {
                        // Merge with list info
                        const payload = {
                            ...details,
                            name: item.cname,
                            id: item.heroid,
                            officialInfo: item
                        };

                        await DraftChange.create({
                            type: 'NEW_HERO',
                            targetHeroName: item.cname,
                            payload: payload,
                            discoveredAt: new Date()
                        });

                        this.logger.info(`[Discovery] Created NEW_HERO draft for ${item.cname}`);
                        result.draftsCreated++;
                        result.found++;
                    }
                } catch (err) {
                    this.logger.error(`[Discovery] Failed to draft hero ${item.cname}: ${err.message}`);
                    result.errors++;
                }
            }

        } catch (err) {
            this.logger.error(`[Discovery] Error scanning heroes: ${err.message}`);
        }

        return result;
    }

    /**
     * Scan for new skins for existing heroes
     */
    async scanForNewSkins() {
        this.logger.info('[Discovery] Scanning for new skins...');
        let result = { found: 0, draftsCreated: 0 };

        // Iterate all heroes
        const heroes = await Hero.find({});

        for (const hero of heroes) {
            // Random delay to be nice
            await new Promise(r => setTimeout(r, 1000));

            try {
                // We can use Wiki data for skins as it's often most complete for "names"
                // Or Official if available. Let's use Wiki for now as implemented in fetcher.
                const wikiData = await this.heroFetcher.fetchWikiData(hero.name);

                if (wikiData && Array.isArray(wikiData.skins)) {
                    const dbSkins = new Set(hero.skins.map(s => this.normalizeName(s.name)));

                    for (const skin of wikiData.skins) {
                        const normSkinName = this.normalizeName(skin.name);
                        const lowerName = skin.name.toLowerCase();

                        // Fix: Ignore "Classic" or "Default" skins which are often the base hero
                        if (['classic', 'default'].includes(normSkinName)) continue;

                        // Filter: Ignore AOV / Arena of Valor skins
                        if (lowerName.includes('aov') || lowerName.includes('arena of valor')) continue;

                        if (dbSkins.has(normSkinName)) continue;

                        // Check pending draft
                        const pending = await DraftChange.findOne({
                            type: 'NEW_SKIN',
                            targetHeroName: hero.name,
                            'payload.name': skin.name,
                            status: 'PENDING'
                        });

                        if (pending) continue;

                        this.logger.info(`[Discovery] NEW SKIN FOUND: ${skin.name} for ${hero.name}`);

                        await DraftChange.create({
                            type: 'NEW_SKIN',
                            targetHeroName: hero.name,
                            targetHeroId: hero._id,
                            payload: skin,
                            discoveredAt: new Date()
                        });

                        result.draftsCreated++;
                        result.found++;
                    }
                }
            } catch (err) {
                this.logger.warn(`[Discovery] Failed skin scan for ${hero.name}: ${err.message}`);
            }
        }

        return result;
    }

    normalizeName(name) {
        if (!name) return '';
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
}

module.exports = { HoKDiscoveryService };
