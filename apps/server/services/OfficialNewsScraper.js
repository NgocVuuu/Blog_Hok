const puppeteer = require('puppeteer');
const News = require('../models/News');
const TurndownService = require('turndown');
const { strikethrough, taskListItems, gfm } = require('turndown-plugin-gfm');

/**
 * Service to scrape official Honor of Kings news (specifically Server Updates) using Puppeteer
 * Bypasses SPA/Dynamic loading that blocks standard axios requests.
 */
class OfficialNewsScraper {
    constructor(logger = console) {
        this.logger = logger;
        
        // Initialize Markdown Converter
        this.turndownService = new TurndownService({
             headingStyle: 'atx',
             codeBlockStyle: 'fenced'
        });
        this.turndownService.use(gfm);
        // Keep tables as HTML or convert them? 
        // AdminPostForm keeps tables so we should too, or convert if possible.
        // gfm plugin handles tables usually.
        this.turndownService.keep(['table']);
    }

    /**
     * Main entry point to scrape and create drafts
     * @param {boolean} forceUpdateAll - If true, re-scrapes and updates all found matching articles regardless of existence.
     * @returns {Promise<number>} Number of drafts created
     */
    async scrapeOfficialNews(forceUpdateAll = false) {
        this.logger.info(`[NewsScraper] Starting official news scrape... (Force Update: ${forceUpdateAll})`);
        let browser = null;
        let createdCount = 0;

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            // Optimization: Block media to load faster
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // 1. Navigate to List Page
            this.logger.info('[NewsScraper] Navigating to news list...');
            await page.goto('https://www.honorofkings.com/global-en/news-list.html', { 
                waitUntil: 'domcontentloaded',
                timeout: 60000 
            });

            // Wait for at least one news item
            try {
                await page.waitForSelector('.news_list li', { timeout: 30000 });
            } catch (e) {
                this.logger.error('[NewsScraper] Timeout waiting for news list selector.');
                return 0;
            }

            // 2. Extract Data from List
            const articles = await page.evaluate(() => {
                const items = document.querySelectorAll('.news_list li a');
                return Array.from(items).map(item => {
                    const titleEl = item.querySelector('.news_rt_tit');
                    const timeEl = item.querySelector('.news_rt_timeSpan'); 
                    // Fallback selectors
                    const title = titleEl ? titleEl.innerText.trim() : '';
                    // The site uses various structures, sometimes .news_rt_time
                    const rawDate = item.querySelector('.news_rt_time') ? item.querySelector('.news_rt_time').innerText.trim() : '';
                    return {
                        title: title,
                        dateStr: rawDate,
                        link: item.href
                    };
                });
            });

            this.logger.info(`[NewsScraper] Found ${articles.length} articles on first page.`);
            
            // 3. Filter for "Server Update Announcement"
            const updates = articles.filter(a => 
                a.title.toLowerCase().includes('server update announcement') || 
                a.title.toLowerCase().includes('patch notes')
            );
            
            this.logger.info(`[NewsScraper] Found ${updates.length} potential update announcements.`);

            for (const item of updates) {
                // Check redundancy
                const exists = await News.findOne({ title: item.title });
                let shouldUpdate = forceUpdateAll;

                if (exists && !shouldUpdate) {
                    // Check if content is HTML OR contains garbage "MORE NOTICE"
                    const isHtml = exists.content && exists.content.trim().startsWith('<');
                    const hasGarbage = exists.content && (exists.content.includes('MORE NOTICE') || exists.content.includes('NEWSALL NEWS'));
                    
                    if (isHtml || hasGarbage) {
                        this.logger.info(`[NewsScraper] Found HTML or Garbage content in ${item.title}, updating...`);
                        shouldUpdate = true;
                    } 
                    // Force update if content is suspiciously short but exists (likely previous bad scrape)
                    else if (exists.content.length < 200) {
                         this.logger.info(`[NewsScraper] Content too short (${exists.content.length} chars) for ${item.title}, forcing update...`);
                         shouldUpdate = true;
                    }
                    else {
                        this.logger.info(`[NewsScraper] Skipped existing (Good Content): ${item.title}`);
                        continue;
                    }
                }
                
                // Determine Creation Date
                let targetDate = new Date();
                const matched = item.title.match(/Announcement\s*[-]*\s*(\d+)\/(\d+)/i);
                if (matched) {
                    const month = parseInt(matched[1], 10);
                    const day = parseInt(matched[2], 10);
                    const now = new Date();
                    let year = now.getFullYear();
                    

                    if (now.getFullYear() > year + 1) {
                         // Some safety just in case we are significantly drifted
                         year = now.getFullYear();
                    }
                    
                    targetDate = new Date(year, month - 1, day);
                    
                    // Logic Fix: If parsed date is in the future (relative to today + buffer), it must be last year.
                    const buffer = 1000 * 60 * 60 * 24 * 5; // 5 days buffer for timezone mishaps
                    if (targetDate.getTime() > (now.getTime() + buffer)) {
                        targetDate.setFullYear(targetDate.getFullYear() - 1);
                    }
                    
                } else if (item.dateStr) {
                    targetDate = new Date(item.dateStr); 
                }
                
                // Validate Date or fallback to now
                if (isNaN(targetDate.getTime())) {
                    this.logger.warn(`[NewsScraper] Invalid date parsed for ${item.title}, defaulting to NOW.`);
                    targetDate = new Date();
                }

                this.logger.info(`[NewsScraper] Scraping detail: ${item.title} (${targetDate.toISOString()})`);

                // Intercept API content if available (Common in SPAs)
                let apiContent = "";
                page.removeAllListeners('response'); // Clear previous listeners
                
                page.on('response', async (response) => {
                    try {
                        const url = response.url();
                        // Relaxed check
                        if (url.includes('/api/') || url.includes('GetContent')) {
                             // this.logger.info(`[NewsScraper] Inspecting response: ${url}`); // Too noisy? 
                             try {
                                 const text = await response.text();
                                 if (text.includes('"content":"')) {
                                     const json = JSON.parse(text);
                                     if (json.data && json.data.content) {
                                         const newContent = json.data.content;
                                         if (newContent.length > apiContent.length) {
                                              this.logger.info(`[NewsScraper] Captured API content from ${url} (Length: ${newContent.length})`);
                                              apiContent = newContent;
                                         }
                                     }
                                 }
                             } catch (parseErr) {
                                 // ignore
                             }
                        }
                    } catch (e) {
                        // ignore parsing errors
                    }
                });

                // 4. Navigate to Detail
                try {
                    await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    
                    // Force wait for render
                    // User report: content loads very slowly.
                    // Instead of fixed sleep, we poll for content.
                    this.logger.info(`[NewsScraper] Waiting for content to render...`);
                    
                    try {
                        await page.waitForFunction(() => {
                            // Helper to check if node has meaningful text
                            const hasText = (node) => node && node.innerText.trim().length > 50;
                            
                            const c1 = document.querySelector('.news_detial_sin');
                            const c2 = document.querySelector('.news_contin');
                            const c3 = document.querySelector('.news_cont');
                            const c4 = document.querySelector('.news_txt');
                            
                            // Also checking if we captured API content implicitly by waiting (simulated)
                            // Actually, waitForFunction runs in browser context, so it can't see apiContent.
                            
                            return hasText(c1) || hasText(c2) || hasText(c3) || hasText(c4);
                        }, { timeout: 30000 }); // Wait up to 30s for text to appear
                    } catch (e) {
                         this.logger.warn(`[NewsScraper] WaitForFunction timed out. proceeding with what we have.`);
                    }

                    // Debug: check what we have
                    const bodyClasses = await page.evaluate(() => document.body.className);
                    this.logger.info(`[NewsScraper] Page loaded. Body classes: ${bodyClasses}`);

                    // Try to find ANY content container
                    const contentSelector = '.news_cont, .news_contin, .news_detial_sin, .mnews_det, .news_dt_cont, .news_detail';
                    
                    try {
                        await page.waitForSelector(contentSelector, { timeout: 10000 });
                    } catch(e) {
                         this.logger.warn(`[NewsScraper] Standard selector failed. Dumping all div classes...`);
                         // Only dump if we don't have API content
                         if (!apiContent) {
                             const divs = await page.evaluate(() => Array.from(document.querySelectorAll('div')).map(d => d.className).filter(c=>c).slice(0, 20));
                             this.logger.info(`[NewsScraper] Div classes: ${divs.join(', ')}`);
                             throw e;
                         }
                    }

                    let contentHtml = apiContent;

                    if (!contentHtml) {
                        // Extract innerHTML with aggressive cleanup
                        contentHtml = await page.evaluate(() => {
                            // 1. Try to find the most specific content container
                            // .news_detial_sin often contains just BACK button on some layouts?
                            // .news_contin seems to have the full content in the debug log
                            let root = document.querySelector('.news_detial_sin');
                            // If .news_detial_sin is too small (e.g., just "BACK"), try generic
                            if (!root || root.innerText.trim().length < 50) {
                                root = document.querySelector('.news_contin') || 
                                        document.querySelector('.news_cont') ||
                                        document.querySelector('article');
                            }
                            
                            if (!root) return null;
                            
                            const clone = root.cloneNode(true);
                            
                            // Cleanup garbage
                            const selectorsToRemove = [
                                '.news_head', '.news_rt_tit', '.news_rt_time', '.news_back', '.news_back_btn',
                                '.news_back_div', '.news_detail_back', 'a[href*="news-list"]', '.news_more',
                                '.more_notice', '.more_notice2', '.news_recommend', '.news_list', '.hok_news_list',
                                '.share_box', '.news_share', '.news_position', '.news_detial_time', '.news_detail_t',
                                '.next_prev', '.prev_next', 'style', 'script', 'iframe',
                                // New classes found in dump
                                '.hok_store', '.fot_logo', '.copyright', '.copyright_link', '.mod-orient-layer'
                            ];
                            
                            selectorsToRemove.forEach(sel => {
                                const found = clone.querySelectorAll(sel);
                                found.forEach(el => el.remove());
                            });
                            
                            // Remove "BACK" links
                            clone.querySelectorAll('*').forEach(el => {
                                if (['A', 'DIV', 'SPAN', 'P'].includes(el.tagName) && el.innerText.trim() === 'BACK') el.remove();
                                if (el.innerText.trim() === 'MORE NOTICE') el.remove();
                            });

                            return clone.innerHTML;
                        });
                    } else {
                        this.logger.info(`[NewsScraper] Using intercepted API content for ${item.title}`);
                    }



                    if (!contentHtml) {
                        this.logger.warn(`[NewsScraper] No meaningful content found for ${item.title} (Empty or garbage). Skipping.`);
                        
                        // If it exists in DB with garbage/empty content, we might want to delete it?
                        // Or just leave it? For now, let's just not update it with empty stuff.
                        // But user specifically complained about empty posts.
                        if (exists) {
                             // Mark as draft-hidden or delete?
                             // Let's just log it.
                        }
                        continue;
                    }

                    // 5. Process & Reformating
                    this.logger.info(`[NewsScraper] Raw API Content Length: ${contentHtml ? contentHtml.length : 0}`);
                    
                    const extractedImage = this.extractImageFromHtml(contentHtml);

                    const finalContentHTML = this.formatContent(contentHtml, item.title, targetDate);
                    let finalMarkdown = this.turndownService.turndown(finalContentHTML);
                    
                    this.logger.info(`[NewsScraper] Markdown Length Before Table: ${finalMarkdown.length}`);
                    
                    // Apply Table Prettifier
                    finalMarkdown = this.prettifyStatsToMarkdownTable(finalMarkdown);
                    
                    this.logger.info(`[NewsScraper] Markdown Length After Table: ${finalMarkdown.length}`);

                    if (shouldUpdate && exists) {
                        exists.content = finalMarkdown;
                        // optionally update summary if needed
                        await exists.save();
                        this.logger.info(`[NewsScraper] Successfully UPDATED draft to Markdown: ${item.title}`);
                    } else {
                        // 6. Save Draft
                        await News.create({
                            title: item.title,
                            slug: this.slugify(item.title),
                            content: finalMarkdown,
                            summary: `Official Server Update Announcement for ${targetDate.toLocaleDateString()}.`,
                            status: 'published',
                            category: 'updates',
                            createdAt: targetDate,
                            image: extractedImage,
                            keywords: 'Honor of Kings Update, Patch Notes, HoK News, Hero Adjustments'
                        });
                        createdCount++;
                        this.logger.info(`[NewsScraper] Successfully created draft: ${item.title}`);
                    }

                } catch (navError) {
                    if (apiContent && apiContent.length > 500) {
                        this.logger.info(`[NewsScraper] Navigation failed/timed out, but API content was captured! Proceeding...`);
                        
                        // Proceed with processing using duplicated code or refactored method
                        // For now, let's just do the processing here to save the day
                        let contentHtml = apiContent;
                        this.logger.info(`[NewsScraper] Raw API Content Length: ${contentHtml.length}`);

                        const extractedImage = this.extractImageFromHtml(contentHtml);

                        const finalContentHTML = this.formatContent(contentHtml, item.title, targetDate);
                        let finalMarkdown = this.turndownService.turndown(finalContentHTML);
                        
                        this.logger.info(`[NewsScraper] Markdown Length Before Table: ${finalMarkdown.length}`);
                        finalMarkdown = this.prettifyStatsToMarkdownTable(finalMarkdown);
                        this.logger.info(`[NewsScraper] Markdown Length After Table: ${finalMarkdown.length}`);

                        if (shouldUpdate && exists) {
                            exists.content = finalMarkdown;
                            await exists.save();
                            this.logger.info(`[NewsScraper] Successfully UPDATED draft to Markdown (Rescue Mode): ${item.title}`);
                        } else {
                            await News.create({
                                title: item.title,
                                slug: this.slugify(item.title),
                                content: finalMarkdown,
                                summary: `Official Server Update Announcement for ${targetDate.toLocaleDateString()}.`,
                                status: 'published',
                                category: 'updates',
                                createdAt: targetDate,
                                image: extractedImage,
                                keywords: 'Honor of Kings Update, Patch Notes, HoK News, Hero Adjustments'
                            });
                            createdCount++;
                            this.logger.info(`[NewsScraper] Successfully created draft (Rescue Mode): ${item.title}`);
                        }

                    } else {
                        this.logger.error(`[NewsScraper] Failed to scrape detail ${item.link}: ${navError.message}`);
                    }
                }
            }

        } catch (error) {
            this.logger.error(`[NewsScraper] Global crash: ${error.message}`);
        } finally {
            if (browser) await browser.close();
        }

        return createdCount;
    }

    /**
     * Extracts the first image source from HTML content
     * @param {string} html 
     * @returns {string|null}
     */
    extractImageFromHtml(html) {
        if (!html) return null;
        const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        return (match && match[1]) ? match[1] : null;
    }

    /**
     * Refactor HTML content to be SEO friendly, attractive, and clean.
     */
    formatContent(html, title, date) {
        let content = html;

        // Strip scripts/styles
        content = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
        content = content.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");

        // Remove tiny images/icons/emojis
        content = content.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); 
        
        // Remove style and class attributes to strip their CSS
        content = content.replace(/ style="[^"]*"/g, '');
        content = content.replace(/ class="[^"]*"/g, '');

        // Wrap "Hero Adjustments" in a specialized div if found
        // This is a naive heuristic
        content = content.replace(/Hero Adjustments/gi, '<h2>Hero Adjustments</h2>');
        
        // Remove empty paragraphs
        content = content.replace(/<p>\s*<\/p>/g, '');

        // ----------------------------------------------------
        // Auto-Table Converter (Heuristic)
        // ----------------------------------------------------
        // Pattern: Matches a structured block of "Stat: Before ... Now ..."
        // This regex looks for blocks that look like stats adjustments
        
        // This is complex on HTML. It's often safer to convert to MD first, then regex replace tables.
        // But let's try to inject HTML tables if the structure is clear.
        
        // Strategy: Convert sequential "Before: X / Now: Y" paragraphs into a table?
        // Let's rely on Turndown service for MD conversion, then post-process the Markdown.
        // So we do NOT do it here in `formatContent` (HTML phase).
        // Check `scrapeOfficialNews` loop where `turndownService` is called.
        // We will move this logic to a helper function called AFTER turndown.
        
        return `
            <div class="official-update-wrapper">
                <h2>Official Update Note - ${date.toLocaleDateString()}</h2>
                <div class="source-link" style="margin-bottom: 20px; color: #888;">
                    Source: <a href="https://honorofkings.com" target="_blank" rel="nofollow">Honor of Kings Official</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <div class="update-content">
                    ${content}
                </div>
            </div>
        `;
    }
    
    /**
     * Post-processes markdown to create tables from stat dumps
     */
    prettifyStatsToMarkdownTable(markdown) {
        let processed = markdown;

        // 1. Identify "Stat Change" blocks: 
        // Label \n Before: X \n Now: Y
        const statBlockRegex = /([^\n]+)\n+Before: ([^\n]+)\n+Now: ([^\n]+)/g;

        // 2. Replace each block with a standardized table ROW, but we need headers initially.
        // We act recursively. 
        // Strategy: First pass, wrap generic replacement.
        
        // We'll use a unique marker for rows so we can join them later.
        
        processed = processed.replace(statBlockRegex, (match, label, before, now) => {
            const cleanLabel = label.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/:$/, '').trim();
            return `__TableRowStart__| **${cleanLabel}** | ${before.trim()} | ${now.trim()} |__TableRowEnd__`;
        });
        
        // 3. Now look for adjacent TableRow blocks and wrap them in a Table Header/Footer.
        
        // Split by newlines to process line by line is safer than complex regex
        const lines = processed.split('\n');
        const outputLines = [];
        let inTable = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('__TableRowStart__')) {
                // Formatting the row content
                const rowContent = line.replace('__TableRowStart__', '').replace('__TableRowEnd__', '');
                
                if (!inTable) {
                    // Start a new table
                    outputLines.push('');
                    outputLines.push('| Adjustment | Before | Now |');
                    outputLines.push('| :--- | :--- | :--- |');
                    inTable = true;
                }
                outputLines.push(rowContent);
            } else {
                if (inTable && line === '') {
                    // Empty line might allow table to continue if next line is also row?
                    // Check next line
                    if (lines[i+1] && lines[i+1].includes('__TableRowStart__')) {
                        continue; // Skip empty line inside table cluster
                    }
                    inTable = false;
                    outputLines.push(line);
                } else {
                    inTable = false;
                    outputLines.push(line);
                }
            }
        }
        
        return outputLines.join('\n');
    }

    slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
}

module.exports = { OfficialNewsScraper };