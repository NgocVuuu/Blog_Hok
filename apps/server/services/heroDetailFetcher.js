const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service to fetch detailed hero information from:
 * 1. Official Website (API/UI) -> Avatar, Skills, Builds, Arcana
 * 2. Fandom Wiki -> Lore, Skins, Relationships
 */
class HeroDetailFetcher {
    constructor(logger = console) {
        this.logger = logger;
    }

    /**
     * Initialize browser (shared logic)
     */
    async launchBrowser() {
        return await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1920x1080'
            ]
        });
    }

    /**
     * Fetch data from Official HoK Website
     * Intercepts `getinformationcard` API
     * @param {string} heroId The official hero ID (e.g., 199)
     * @param {Object} options Options { blockResources: boolean }
     */
    async fetchOfficialData(heroId, { blockResources = false } = {}) {
        this.logger.info(`[Hero Scraper] Fetching official data for ID: ${heroId} (Block Resources: ${blockResources})`);
        let browser = null;
        let cardData = null;
        let pageDetails = {
            title: '',
            banner: ''
        };

        try {
            browser = await this.launchBrowser();
            const page = await browser.newPage();

            // Set User Agent to avoid bot detection
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // --- OPTIMIZATION: Block heavy resources if requested ---
            if (blockResources) {
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    const resourceType = req.resourceType();
                    if (['image', 'media', 'font', 'stylesheet', 'texttrack'].includes(resourceType)) {
                        req.abort();
                    } else {
                        req.continue();
                    }
                });
            }

            // Setup wait BEFORE navigation
            // Setup wait BEFORE navigation
            // Collection for API responses
            const capturedResponses = [];

            // Listen for ALL matching responses
            page.on('response', async (res) => {
                if (res.url().includes('getherodataall') && res.status() === 200 && res.request().method() !== 'OPTIONS') {
                    try {
                        const json = await res.json();
                        const len = JSON.stringify(json).length;
                        this.logger.info(`[Hero Scraper] Captured API response. Length: ${len}`);
                        capturedResponses.push({ json, len });
                    } catch (e) {
                        // ignore parse errors
                    }
                }
            });

            // Use Hash URL to trigger API
            const targetUrl = `https://camp.honorofkings.com/h5/app/index.html?lang=en&from=official&heroId=${heroId}#/hero-detail?heroId=${heroId}`;
            this.logger.info(`[Hero Scraper] Navigating to: ${targetUrl}`);

            // Log all requests to debug
            page.on('request', request => {
                try {
                    require('fs').appendFileSync('debug_requests.log', request.url() + '\n');
                } catch (e) { }
            });

            // Wait for network idle to ensure we get late packets
            try {
                await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
            } catch (e) {
                this.logger.warn(`[Hero Scraper] Navigation timeout (continuing check): ${e.message}`);
            }

            // Select Best Response
            if (capturedResponses.length > 0) {
                // Sort by length descending
                capturedResponses.sort((a, b) => b.len - a.len);
                const best = capturedResponses[0];
                this.logger.info(`[Hero Scraper] Selected Best API Response (Length: ${best.len}). Total captured: ${capturedResponses.length}`);

                if (best.json.data) {
                    cardData = best.json.data;
                }
            } else {
                this.logger.warn(`[Hero Scraper] No API responses captured.`);
            }

            await sleep(2000); // Allow app to hydrate for UI scraping

            // UI Scraping for Title and Banner (High Res)
            try {
                pageDetails = await page.evaluate(() => {
                    const cleanUrl = (url) => url ? url.split('?')[0] : '';
                    // ... (keep existing UI scraping logic)
                    const titleEl = document.querySelector('.heroName-orn4t') || document.querySelector('.hero-name');

                    const coverEl = document.querySelector('.hero-cover') || document.querySelector('.poster-img');
                    let coverSrc = '';
                    if (coverEl) {
                        const style = window.getComputedStyle(coverEl);
                        const bg = style.backgroundImage;
                        if (bg && bg.startsWith('url')) {
                            coverSrc = bg.slice(5, -2);
                        } else if (coverEl.tagName === 'IMG') {
                            coverSrc = coverEl.src;
                        }
                    }
                    if (!coverSrc) {
                        const bannerImg = document.querySelector('img[class*="heroImg"]') || document.querySelector('.poster-img');
                        coverSrc = bannerImg ? bannerImg.src : '';
                    }

                    const avatarImg = document.querySelector('.head-img') ||
                        document.querySelector('.hero-icon__img') ||
                        document.querySelector('.hero-head img') ||
                        document.querySelector('img[class*="head"]');
                    const avatarSrc = avatarImg ? avatarImg.src : '';

                    // Try scraping skills from DOM
                    const skillNodes = document.querySelectorAll('.skill-list .item, [class*="skill-item"]');
                    const domSkills = Array.from(skillNodes).map(node => {
                        const img = node.querySelector('img');
                        const name = node.querySelector('.name')?.innerText;
                        const desc = node.querySelector('.desc')?.innerText;
                        return { name, icon: img ? img.src : '', description: desc };
                    });

                    return {
                        title: titleEl?.innerText?.trim() || '',
                        banner: cleanUrl(coverSrc),
                        avatar: cleanUrl(avatarSrc),
                        cover: cleanUrl(coverSrc),
                        domSkills
                    };
                });
                this.logger.info(`[Hero Scraper] UI Scraped: Banner=${!!pageDetails.banner}, Skills=${pageDetails.domSkills?.length}`);
            } catch (err) {
                this.logger.warn(`[Hero Scraper] UI scraping warning: ${err.message}`);
            }

            // Scrape Real-Time Stats (Win/Ban/Pick/Tier)
            let realTimeStats = {};
            try {
                realTimeStats = await page.evaluate(() => {
                    const stats = {
                        winRate: null,
                        banRate: null,
                        pickRate: null,
                        tRank: null
                    };

                    const findStat = (labelText) => {
                        const allDivs = Array.from(document.querySelectorAll('div, span, p'));
                        for (const div of allDivs) {
                            if (div.innerText && div.innerText.includes(labelText) && div.innerText.length < 50) {
                                const text = div.innerText;
                                const lines = text.split('\n');
                                const valueLine = lines.find(l => l.includes('%'));
                                if (valueLine) return parseFloat(valueLine);
                            }
                        }
                        return null;
                    };

                    stats.winRate = findStat('Win Rate');
                    stats.banRate = findStat('Ban Rate');
                    stats.pickRate = findStat('Pick Rate');

                    const allDivs = Array.from(document.querySelectorAll('div, span'));
                    const tierDiv = allDivs.find(d => /^T[0-9]$/.test(d.innerText.trim()));
                    if (tierDiv) stats.tRank = tierDiv.innerText.trim();

                    return stats;
                });
                this.logger.info(`[Hero Scraper] Real-time stats: ${JSON.stringify(realTimeStats)}`);
            } catch (err) {
                this.logger.warn(`[Hero Scraper] Stats scraping failed: ${err.message}`);
            }

            if (!cardData) {
                this.logger.warn(`[Hero Scraper] API data missing for ${heroId}. Using CN Fallbacks.`);
                try {
                    require('fs').writeFileSync(require('path').resolve(process.cwd(), 'debug_api_status.txt'), 'API_MISSING');
                } catch (e) { }
            } else {
                this.logger.info(`[Hero Scraper] Captured API data for ${heroId}`);
                try {
                    require('fs').writeFileSync(require('path').resolve(process.cwd(), 'debug_api_status.txt'), 'API_CAPTURED');
                } catch (e) { }
            }

            // Construct CN Fallbacks
            const cnAvatar = `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${heroId}/${heroId}.jpg`;
            const cnBanner = `https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/${heroId}/${heroId}-bigskin-1.jpg`;

            // Attach stats to pageDetails
            pageDetails.stats = realTimeStats;

            const result = this.processOfficialData(cardData || {}, pageDetails);

            // Apply fallbacks if empty
            if ((!result.avatar || result.avatar.length < 5) && heroId) {
                result.avatar = cnAvatar;
                fs.appendFileSync('debug_scraper.log', `[${heroId}] Used CN Avatar: ${cnAvatar}\n`);
                this.logger.info(`[Hero Scraper] Used CN Avatar fallback.`);
            }
            if ((!result.banner || result.banner.length < 5) && heroId) {
                result.banner = cnBanner;
                fs.appendFileSync('debug_scraper.log', `[${heroId}] Used CN Banner: ${cnBanner}\n`);
                this.logger.info(`[Hero Scraper] Used CN Banner fallback.`);
            }

            return result;

        } catch (error) {
            this.logger.error(`[Hero Scraper] Official data fetch failed: ${error.message}`);
            return null;
        } finally {
            if (browser) await browser.close();
        }
    }

    processOfficialData(data, pageDetails) {
        const cleanUrl = (url) => url ? url.split('?')[0] : '';

        // Merge API skills with DOM skills if needed
        let skills = [];
        // DEBUG LOGGING
        if (data.skillList && data.skillList.length > 0) {
            console.log('[processOfficialData] Using API skillList');
            skills = data.skillList.map(s => ({
                name: s.skillName,
                icon: cleanUrl(s.skillIcon),
                description: s.skillDesc,
                cooldown: s.cd,
                cost: s.cost
            }));
        } else if (pageDetails?.domSkills && pageDetails.domSkills.length > 0) {
            console.log('[processOfficialData] Using DOM Skills fallback. Count:', pageDetails.domSkills.length);
            skills = pageDetails.domSkills.map(s => ({
                name: s.name,
                icon: cleanUrl(s.icon),
                description: s.description
            }));
        } else {
            console.log(`[processOfficialData] No skills found in API or DOM. API List: ${data.skillList ? data.skillList.length : 'undefined'}, DOM List: ${pageDetails?.domSkills ? pageDetails.domSkills.length : 'undefined'}`);
        }

        // Dump Strategy Data if available
        if (data.strategyData) {
            try {
                require('fs').writeFileSync('debug_last_strategy.json', JSON.stringify(data.strategyData, null, 2));
            } catch (e) { }
        }

        return {
            title: pageDetails?.title || '',
            avatar: pageDetails?.avatar || cleanUrl(data.heroIcon),
            banner: pageDetails?.banner || cleanUrl(data.heroIcon),
            cover: pageDetails?.cover || '', // New field
            stats: pageDetails?.stats || {}, // Dynamic stats
            skills,
            strategyData: data.strategyData, // Critical for Official Builds
            rawPresets: {
                equip: data.equip,
                arcana: data.arcana
            }
        };
        const sampleData = {
            equipCount: data.equip ? data.equip.length : 0,
            arcanaCount: data.arcana ? data.arcana.length : 0,
            equipSample: data.equip ? data.equip.slice(0, 1) : null,
            arcanaSample: data.arcana ? data.arcana.slice(0, 5) : null,
            keys: Object.keys(data)
        };
        try {
            require('fs').writeFileSync('debug_api_sample.json', JSON.stringify(sampleData, null, 2));
        } catch (e) { }

        console.log('[Hero Scraper] Processed Raw Presets, saved to debug_api_sample.json');
        return {
            title: pageDetails?.title || '',
            avatar: pageDetails?.avatar || cleanUrl(data.heroIcon),
            banner: pageDetails?.banner || cleanUrl(data.heroIcon),
            cover: pageDetails?.cover || '',
            stats: pageDetails?.stats || {},
            skills,
            rawPresets: {
                equip: data.equip,
                arcana: data.arcana
            }
        };
    }


    /**
     * Resolve Hero Name for Scrapers (Handle Typos/Nicknames)
     */
    resolveHeroName(rawName) {
        const MAPPINGS = {
            'Gao': 'Gao Jianli',
            'Shi': 'Xi Shi',
            'Menki': 'Meng Qi',
        };
        return MAPPINGS[rawName] || rawName;
    }

    /**
   * Fetch hero data from Liquipedia (Priority for Lane, Role, Skins)
   */
    async fetchLiquipediaData(rawName) {
        const heroName = this.resolveHeroName(rawName);
        const cleanName = heroName.replace(/\s+/g, '_'); // Chicha, Hou_Yi
        const url = `https://liquipedia.net/honorofkings/${cleanName}`;
        this.logger.info(`[Hero Scraper] Fetching Liquipedia data for: ${heroName} (Raw: ${rawName})`);

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // --- OPTIMIZATION: Block heavy resources ---
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            if (!response.ok()) {
                this.logger.warn(`[Hero Scraper] Liquipedia page not found for ${heroName} (Status: ${response.status()})`);
                await browser.close();
                return null;
            }

            const data = await page.evaluate(() => {
                const result = { lanes: [], roles: [], skins: [], title: '' };

                // 1. Infobox: Title, Lane, Role
                const labels = Array.from(document.querySelectorAll('.infobox-cell-2.infobox-description'));

                // Lane
                const laneLabel = labels.find(el => el.textContent.trim().includes('Lane:'));
                if (laneLabel && laneLabel.nextElementSibling) {
                    result.lanes = laneLabel.nextElementSibling.innerText.split('\n').map(x => x.trim()).filter(x => x);
                }

                // Role
                const roleLabel = labels.find(el => el.textContent.trim().includes('Role:'));
                if (roleLabel && roleLabel.nextElementSibling) {
                    result.roles = roleLabel.nextElementSibling.innerText.split('\n').map(x => x.trim()).filter(x => x);
                }

                // Title (e.g. "Forge Maiden")
                // Usually in .infobox-header-2
                const headers = Array.from(document.querySelectorAll('.infobox-header-2'));
                // The first one is usually the Title (Hero Name is usually in the first header, Title in second?)
                // In dump: 
                // Header 1: [e][h] Chicha
                // Header 2: Forge Maiden
                // Header 3: General Information
                if (headers.length >= 1) {
                    // Check if it's not "General Information"
                    const potentialTitle = headers[0].innerText.trim();
                    if (potentialTitle !== 'General Information' && !potentialTitle.includes('Esports Statistics')) {
                        result.title = potentialTitle;
                    }
                }

                // 1.5 Portrait (Main Image)
                const infoboxImage = document.querySelector('.infobox-image img');
                if (infoboxImage) {
                    result.portrait = infoboxImage.src;
                }

                // 2. Skins (Splash Arts)
                const skinBoxes = Array.from(document.querySelectorAll('.template-box'));
                skinBoxes.forEach(box => {
                    const th = box.querySelector('th');
                    if (th && th.childNodes.length > 0) {
                        const name = th.childNodes[0].textContent.trim();
                        if (name) {
                            const hasChinese = /[\u4e00-\u9fa5]/.test(name);
                            if (!hasChinese) {
                                // Try to find image
                                const imgs = Array.from(box.querySelectorAll('img'));
                                // Filter out badges/icons (usually small width < 150)
                                // Use getAttribute('width') or estimated size.
                                // Prefer image with 'width' > 200
                                const splash = imgs.find(img => {
                                    const w = parseInt(img.getAttribute('width') || '0');
                                    return w > 200;
                                }) || imgs[0]; // Fallback to first if no large image found

                                let image = splash ? splash.src : null;

                                // Fix Resolution: Convert thumb URL to original
                                // Example: .../images/thumb/a/a2/Name.jpg/600px-Name.jpg -> .../images/a/a2/Name.jpg
                                if (image && image.includes('/thumb/')) {
                                    image = image.replace(/\/thumb\//, '/').replace(/\/\d+px-[^/]+$/, '');
                                }

                                result.skins.push({ name, image });
                            }
                        }
                    }
                });

                // 3. Skills with Forms

                // --- 2.5 LORE / STORY (New) ---
                let lore = '';
                const h2s = Array.from(document.querySelectorAll('h2, h3'));

                // DEBUG: Log all headers to see what's available
                // console.log('Headers found:', h2s.map(h => h.innerText)); 

                const storyHeader = h2s.find(h => {
                    const t = h.innerText.toLowerCase();
                    // 'profile' found in Arthur debug
                    return t.includes('story') || t.includes('background') || t.includes('lore') || t.includes('backstory') || t.includes('profile');
                });

                if (storyHeader) {
                    let next = storyHeader.nextElementSibling;
                    let text = [];
                    // Limit loop to avoid infinite or too much text
                    let limit = 15;
                    while (next && limit > 0) {
                        // Stop if hitting another major header
                        if (['H1', 'H2'].includes(next.tagName)) break;

                        if (next.tagName === 'P') {
                            const pText = next.innerText.trim();
                            if (pText) text.push(pText);
                        }
                        next = next.nextElementSibling;
                        limit--;
                    }
                    lore = text.filter(Boolean).join('\n\n');
                }
                result.lore = lore;
                result.debugHeaders = h2s.map(h => h.innerText); // Expose headers for debugging

                // Find the "Skills" header
                const skillsHeader = h2s.find(h => h.innerText.includes('Skills'));

                result.skillBuilds = {};
                result.allSkills = [];

                if (skillsHeader) {
                    let currentForm = 'Default';
                    // Start iterating from the element after the header
                    let el = skillsHeader.nextElementSibling;

                    // Iterate siblings until next H2 (e.g. "Splash Arts" or "Talents")
                    while (el && el.tagName !== 'H2') {
                        // Check for Form Header (H3 or H4 that contains "Form")
                        // Example: <h3>Offensive Form...</h3>
                        if (el.tagName === 'H3' || el.tagName === 'H4') {
                            const text = el.innerText.trim();
                            // Heuristic: Only treat as Form if it explicitly contains "Form" or is a distinct section
                            // Avoid simple "Skill 1", "Passive", "Abilities" being treated as forms
                            const lowerText = text.toLowerCase();
                            const isSkillHeader = /skill|passive|ability|talent/i.test(lowerText);
                            const isFormHeader = /form|stance/i.test(lowerText);

                            if ((el.tagName === 'H3' && !isSkillHeader) || isFormHeader) {
                                currentForm = text.replace(/\[edit\]/g, '').trim();
                            }
                        }

                        // Check for Spellcard
                        let card = null;
                        if (el.classList.contains('spellcard-wrapper')) {
                            card = el;
                        } else if (el.querySelector('.spellcard-wrapper')) {
                            card = el.querySelector('.spellcard-wrapper');
                        }

                        if (card) {
                            const innerCard = card.querySelector('.spellcard');
                            if (innerCard) {
                                // Name extraction
                                const nameEl = innerCard.querySelector('.wiki-backgroundcolor-light');
                                let name = nameEl ? nameEl.innerText.trim() : 'Unknown';

                                // CLEAN NAME: Remove "Passive Skill:", "Skill 1:", "Passive:" prefixes
                                // Example: "Passive: Way of the Sword" -> "Way of the Sword"
                                name = name.replace(/^(Passive|Skill \d+|Ability \d+|Ultimate)(\s*:|\s+-)\s*/i, '');
                                name = name.replace(/^Passive\s+Skill\s*:\s*/i, '');

                                // Icon: Img
                                const img = innerCard.querySelector('img');
                                let icon = img ? img.src : '';

                                // Fix Icon URL if absolute/relative
                                if (icon && icon.startsWith('/')) {
                                    icon = `https://liquipedia.net${icon}`;
                                }

                                // Description: .spellcard-description
                                const descEl = innerCard.querySelector('.spellcard-description');
                                let description = '';
                                if (descEl) {
                                    description = descEl.innerText.trim();
                                }

                                if (name !== 'Unknown') {
                                    const skillObj = { name, icon, description };

                                    // Add to All Skills (Unique)
                                    if (!result.allSkills.find(s => s.name === name)) {
                                        result.allSkills.push(skillObj);
                                    }

                                    // Add to Build
                                    if (!result.skillBuilds[currentForm]) {
                                        result.skillBuilds[currentForm] = [];
                                    }
                                    result.skillBuilds[currentForm].push(skillObj);
                                }
                            }
                        }

                        el = el.nextElementSibling;
                    }
                }

                return result;
            });

            await browser.close();
            return data;

        } catch (error) {
            this.logger.error(`[Hero Scraper] Liquipedia fetch failed for ${heroName}: ${error.message}`);
            if (browser) await browser.close();
            return null;
        }
    }

    async fetchWikiData(rawName) {
        const heroName = this.resolveHeroName(rawName);
        this.logger.info(`[Hero Scraper] Fetching wiki data for: ${heroName} (Raw: ${rawName})`);
        let browser = null;

        try {
            browser = await this.launchBrowser();
            const page = await browser.newPage();
            const urlName = heroName.replace(/ /g, '_');
            const targetUrl = `https://honor-of-kings.fandom.com/wiki/${urlName}`;

            // --- OPTIMIZATION: Block heavy resources ---
            // --- OPTIMIZATION: Block heavy resources ---
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const currentTitle = await page.title();
            if (currentTitle && currentTitle.includes('Client Challenge')) {
                this.logger.warn(`[Hero Scraper] Wiki blocked by Client Challenge for ${heroName}. Waiting...`);
                await sleep(5000); // Wait for challenge
            }

            try {
                await page.waitForSelector('.portable-infobox', { timeout: 15000 });
            } catch (e) {
                // Infobox missing is common if page is redirect or stub
                this.logger.warn(`[Hero Scraper] Wiki infobox not found for ${heroName}`);
            }

            const wikiData = await page.evaluate(async () => {
                const data = {
                    title: '', // From Background
                    lore: '',
                    skins: [],
                    relationships: { allies: [], counters: [], prey: [] },
                    lane: [],
                    class: [], // Array now
                    portrait: '',
                    skills: [] // Wiki skills fallback
                };

                // Helper to wait
                const wait = (ms) => new Promise(r => setTimeout(r, ms));

                const h2s = Array.from(document.querySelectorAll('h2, h3'));
                // console.log('Available Headers:', h2s.map(h => h.innerText)); 
                data.debugHeaders = h2s.map(h => h.innerText);

                let loreHeader = null; // Fix: Initialize variable

                // Find all candidates
                const candidates = h2s.filter(h => {
                    const t = h.innerText.trim().toLowerCase();
                    return t.includes('lore') || t.includes('background') || t.includes('story') || t.includes('intro');
                });

                let bestLore = '';

                for (const h of candidates) {
                    let next = h.nextElementSibling;
                    let parts = [];
                    // Limit lookahead to avoid infinite loop or grabbing too much
                    let limit = 20;
                    while (next && !['H1', 'H2', 'H3'].includes(next.tagName) && limit > 0) {
                        if (next.tagName === 'P') {
                            let clean = next.innerText.replace(/\[\d+\]/g, '').trim();
                            if (clean) parts.push(clean);
                        }
                        // Also handle text inside DIVs if P is not direct sibling (some wikis wrap content)
                        if (next.tagName === 'DIV' && !next.className.includes('toc')) {
                            const ps = next.querySelectorAll('p');
                            ps.forEach(p => {
                                let clean = p.innerText.replace(/\[\d+\]/g, '').trim();
                                if (clean) parts.push(clean);
                            });
                        }
                        next = next.nextElementSibling;
                        limit--;
                    }
                    const full = parts.join('\n\n');
                    // Prefer "Lore" or "Story" if length is good, but generally max length is safest
                    if (full.length > bestLore.length) {
                        bestLore = full;
                    }
                }

                if (bestLore) {
                    data.lore = bestLore;
                }

                if (!loreHeader) {
                    loreHeader = h2s.find(h => {
                        const t = h.innerText.toLowerCase();
                        return t.includes('lore') || t.includes('story') || t.includes('background');
                    });
                }

                if (loreHeader) {
                    let next = loreHeader.nextElementSibling;
                    let textParts = [];
                    // Grab paragraphs until next header
                    while (next && !['H1', 'H2', 'H3'].includes(next.tagName)) {
                        if (next.tagName === 'P') {
                            // Remove citations [1] etc
                            let cleanText = next.innerText.replace(/\[\d+\]/g, '').trim();
                            if (cleanText) textParts.push(cleanText);
                        }
                        next = next.nextElementSibling;
                    }

                    if (textParts.length > 0) {
                        data.lore = textParts.join('\n\n');
                    }
                }

                // 1. Title from "Background" field in Infobox
                // Look for data-source="background" or traverse rows
                const bgRow = document.querySelector('[data-source="background"]');
                if (bgRow) {
                    data.title = bgRow.querySelector('.pi-data-value')?.innerText?.trim();
                }
                // Fallback: Try finding "Background" in table headers
                if (!data.title) {
                    const ths = Array.from(document.querySelectorAll('.pi-item .pi-data-label, th'));
                    const bgTh = ths.find(th => th.innerText.trim() === 'Background');
                    if (bgTh) {
                        const td = bgTh.nextElementSibling || bgTh.parentElement.querySelector('td');
                        if (td) data.title = td.innerText.trim();
                    }
                }

                // 2. Class / Roles (Split "Assassin / Fighter")
                const classEl = document.querySelector('[data-source="class"] .pi-data-value');
                if (classEl) {
                    const rawText = classEl.innerText.trim(); // "Assassin / Fighter"
                    data.class = rawText.split('/').map(s => s.trim()).filter(Boolean);
                }

                // 3. Lane
                const laneEl = document.querySelector('[data-source="lane"] .pi-data-value') || document.querySelector('[data-source="lanes"] .pi-data-value');
                if (laneEl) {
                    // Try to split by children or text content
                    // Extract text content directly to handle cases where links are icons without text
                    const rawText = laneEl.innerText.trim();
                    data.lane = rawText.split(/[\/\,\n]+/).map(s => s.trim()).filter(Boolean);
                }

                // 4. Lore (Handled by 0. Lore Extraction above)


                // 5. Skins (High Res via URL Cleaning)
                // Targeted Strategy: Find the "Skins" header and only look for galleries immediately following it.

                let skinGalleryItems = [];
                const skinHeader = h2s.find(h => h.innerText.includes('Skins') || h.innerText.includes('Appearance'));

                if (skinHeader) {
                    // Collect all sibling elements that are galleries until next header
                    let next = skinHeader.nextElementSibling;
                    while (next && !['H1', 'H2'].includes(next.tagName)) {
                        if (next.classList.contains('wikia-gallery') || next.querySelector('.wikia-gallery-item')) {
                            // Found a gallery container
                            const items = next.querySelectorAll('.wikia-gallery-item');
                            items.forEach(i => skinGalleryItems.push(i));
                        }
                        next = next.nextElementSibling;
                    }
                }

                // Fallback: If no skin header found, but page has gallery items, use them BUT filter aggressively
                if (skinGalleryItems.length === 0) {
                    skinGalleryItems = Array.from(document.querySelectorAll('.wikia-gallery-item'));
                }

                skinGalleryItems.forEach(item => {
                    const caption = item.querySelector('.lightbox-caption')?.innerText || item.querySelector('.gallery-image-wrapper a')?.title;
                    const imgEl = item.querySelector('img');
                    let src = imgEl?.getAttribute('data-src') || imgEl?.src;

                    // Filter out likely non-skin items (e.g. Icons from other galleries)
                    // If the caption is essentially the Hero Title, it's likely the base icon, not a skin (unless it says "Classic")
                    if (caption && data.title && caption.includes(data.title) && !caption.includes('Skin')) {
                        // e.g. "Athena" icon on Meng Ya page
                        // But be careful: "Lady Zhen" might be the name of the default skin?
                        // Usually default skin is "Classic" or "Default" or "Hero Name"
                        // We'll trust "Classic" check later, but here filtering "Athena" on "Meng Ya" page
                    }

                    if (src && caption) {
                        // Clean URL to get max res
                        src = src.replace(/\/scale-to-width-down\/\d+/, '');

                        data.skins.push({ name: caption, image: src });
                    }
                });

                // 6. Skills (Fallback)
                // Look for skill table or list
                const skillTables = document.querySelectorAll('.skill-table, .ability-table'); // Hypothetical class
                // Or just H3 headers for skills?
                // For now, let's try to grab generic skill structure if official failed

                return data;
            });

            return wikiData;

        } catch (error) {
            this.logger.error(`[Hero Scraper] Wiki fetch failed: ${error.message}`);
            return null;
        } finally {
            if (browser) await browser.close();
        }
    }
}

module.exports = { HeroDetailFetcher };
