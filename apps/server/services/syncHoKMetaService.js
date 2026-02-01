const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const HeroRaw = require('../models/HeroRaw');
const Equipment = require('../models/Equipment');
const Arcana = require('../models/Arcana');
const SiteInfo = require('../models/SiteInfo');
const { fetchHeroStatsFromStatic } = require('./hokStaticProvider');
const { uploadImageFromUrl } = require('./cloudinaryService');
const fs = require('fs');
const path = require('path');
const GAME_CONFIG = require('../config/gameData');

function slugify(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function loadNameMap() {
  try {
    const p = path.join(__dirname, '..', 'utils', 'heroNameMap.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8')) || {};
    }
  } catch (e) { }
  return {};
}

// --- SUB-PROCESSORS ---

// Helper to normalize rates (0.53 -> 53.0)
function pct100(x) {
  if (x === null || x === undefined) return 0;
  let n = x;
  if (typeof x === 'string') {
    n = parseFloat(x.replace('%', ''));
  }
  n = Number(n);
  if (!Number.isFinite(n)) return 0;

  // If > 1 (e.g. 53.2), keep it.
  if (n > 1) return Math.round(n * 100) / 100;
  // If <= 1 (e.g. 0.532), multiply by 100.
  return Math.round(n * 10000) / 100;
}

async function processStats(hero, statData, dryRun, logger, scopes = []) {
  if (dryRun) {
    logger.info(`[Stats] Would update stats for ${hero.name}: Tier ${statData.metaTier}, WR ${statData.winRate}%`);
    return {};
  }

  // Map Tier (0 -> T0, 1 -> T1 or "T0" -> "T0")
  let tier = statData.metaTier;
  if (statData.tRank !== undefined && statData.tRank !== null) {
    tier = statData.tRank;
  }
  // Fix: 0 is falsy, so !tier is true. Must check strict undefined/null.
  if ((tier === undefined || tier === null || tier === '') && hero.metaTier) {
    tier = hero.metaTier;
  }
  if (tier === undefined || tier === null || tier === '') {
    tier = 'A';
  }

  if (typeof tier === 'number') {
    tier = 'T' + tier;
  }
  // Convert T0->S+, T1->S, T2->A, T3->B, T4->C?
  // User Schema says enum: ['S+', 'S', 'A', 'B', 'C']
  // Official API returns 0,1,2... (T0, T1, T2)
  // We need a mapper if Schema enforces Enum.
  // Let's assume Schema Enum is strict.
  // T0 = S+
  // T0.5 = S
  // T1 = S
  // T2 = A
  // T3 = B
  // T4 = C ?

  // Or maybe we should relax Schema?
  // Let's check what `checkCurrentStats.js` normally prints. It prints `tier`.
  // If Schema only allows S/A/B, and we try to save 'T0', Mongoose will reject it!
  // This is why it's not saving!

  // Let's check Schema again (Step 844).
  // `metaTier: { type: String, required: true, enum: ['S+', 'S', 'A', 'B', 'C'] }`
  // And `processStats` tries to save `T0`, `T1`.
  // THIS IS THE BUG.

  const TIER_MAP = {
    0: 'S',  // T0 -> S
    1: 'A',  // T1 -> A
    2: 'B',  // T2 -> B
    3: 'C',  // T3 -> C
    4: 'C',  // T4 -> C (Fallback)
    'T0': 'S', 'T1': 'A', 'T2': 'B', 'T3': 'C', 'T4': 'C'
  };

  // If it's a number, map it.
  if (typeof tier === 'number' || (typeof tier === 'string' && tier.startsWith('T'))) {
    let key = typeof tier === 'number' ? tier : tier; // 0 or "T0"
    if (typeof key === 'string' && key.startsWith('T')) key = parseInt(key.replace('T', ''));
    if (TIER_MAP[key]) tier = TIER_MAP[key];
    else tier = 'A'; // Default fallback
  }

  // Map Roles (heroCareer: "Fighter/Tank" -> roles: ["Fighter", "Tank"])
  let roles = hero.roles || [];
  if (scopes.includes('roles')) {
    const rawCareer = statData.heroCareer || statData.heroInfo?.heroCareer || statData.heroInfo?.job;

    if (rawCareer) {
      roles = rawCareer.split('/').map(r => r.trim());
    }
  }

  // Map Lanes (Verified: 0=Clash, 1=Mid, 2=Farm, 3=Jungle, 4=Roam)
  const LANE_MAP = {
    0: 'Clash Lane',
    1: 'Mid Lane',
    2: 'Farm Lane',
    3: 'Jungler',
    4: 'Roamer'
  };
  let lanes = hero.lanes || [];

  if (scopes.includes('lanes')) {
    if (statData.position !== undefined && statData.position !== null && LANE_MAP[statData.position]) {
      lanes = [LANE_MAP[statData.position]];
    }
  }

  const patch = {
    metaTier: tier, // Correct field name
    winRate: pct100(statData.winRate || statData.win_rate || hero.winRate),
    pickRate: pct100(statData.pickRate || statData.showRate || hero.show_rate || hero.pickRate),
    banRate: pct100(statData.banRate || statData.ban_rate || hero.banRate),
  };

  // STRICT SCOPE: Only add roles/lanes if explicitly requested
  if (scopes.includes('roles')) {
    patch.roles = roles;
  }
  if (scopes.includes('lanes')) {
    patch.lanes = lanes;
  }

  return patch;
}

async function processImages(hero, sourceName, officialData, heroId, liquipediaData, wikiData, dryRun, logger) {
  let sourceAvatar = officialData?.cover || officialData?.banner;
  let sourceBanner = officialData?.cover || officialData?.banner;

  // Fallback: Liquipedia/Wiki Portrait
  if (!sourceAvatar && liquipediaData?.portrait) {
    sourceAvatar = liquipediaData.portrait;
    // Liquipedia often doesn't have a wide banner, maybe use portrait as fallback for both?
    // Or keep banner empty if not found.
  }
  if (!sourceAvatar && wikiData?.portrait) {
    sourceAvatar = wikiData.portrait;
  }

  // Fallback to CN (Lowest Priority, but good for CN heroes)
  if ((!sourceAvatar || sourceAvatar.length < 10) && heroId) {
    sourceAvatar = `${GAME_CONFIG.images.avatarBaseUrl}/${heroId}/${heroId}.jpg`;
    // Check if we didn't get banner either
    if (!sourceBanner) {
      sourceBanner = `${GAME_CONFIG.images.skinBannerBaseUrl}/${heroId}/${heroId}-bigskin-1.jpg`;
    }
    logger.info(`[Images] Using CN fallback for ${sourceName}`);
  }

  const basePublicId = slugify(sourceName);
  let finalAvatar = hero.image;
  let finalBanner = hero.bannerImage;

  if (!dryRun) {
    try {
      // Only upload if source is valid
      if (sourceAvatar) {
        const avatarRes = await uploadImageFromUrl(sourceAvatar, GAME_CONFIG.cloudinary.avatars, `${basePublicId}-avatar`);
        if (avatarRes) finalAvatar = avatarRes;
      }
      if (sourceBanner) {
        const bannerRes = await uploadImageFromUrl(sourceBanner, GAME_CONFIG.cloudinary.banners, `${basePublicId}-banner`);
        if (bannerRes) finalBanner = bannerRes;
      }
      logger.info(`[Images] Uploaded for ${sourceName}`);
    } catch (e) {
      logger.error(`[Images] Upload failed for ${sourceName}: ${e.message}`);
    }
  }

  return {
    image: finalAvatar,
    bannerImage: finalBanner,
    cover: finalBanner
  };
}

const axios = require('axios'); // Add axios for HEAD requests

// ...

async function processSkins(hero, sourceName, heroId, liquipediaData, wikiData, dryRun, logger) {
  const basePublicId = slugify(sourceName);
  const finalSkins = [];

  // Strategy: global-only (User Request)
  // Use Liquipedia/Wiki data primarily
  // skinsData is expected to be Array<{ name: string, image: string }>
  const skinsData = liquipediaData?.skins || wikiData?.skins || [];

  logger.info(`[Skins] Processing ${skinsData.length} Global skins for ${sourceName}...`);

  if (!skinsData.length) {
    logger.warn(`[Skins] No Global skin data found for ${sourceName}.`);
    return { skins: hero.skins || [] };
  }

  for (let i = 0; i < skinsData.length; i++) {
    const skinInfo = skinsData[i]; // { name, image }
    const skinIndex = i + 1;
    let finalImage = '';

    if (!dryRun && skinInfo.image) {
      // Upload global image
      // Force unique public ID for global skin
      const skinPublicId = `${basePublicId}-skin-global-${skinIndex}`;
      // Use uploadImageFromUrl to handle download + upload
      const uploaded = await uploadImageFromUrl(skinInfo.image, GAME_CONFIG.cloudinary.skins, skinPublicId);
      finalImage = uploaded || skinInfo.image; // Fallback to source URL if upload fails
    }

    if (!finalImage && hero.skins && hero.skins[i]) {
      // Keep existing if upload failed? Or user wanted ONLY global.
      // If upload failed, we might not have an image.
      // Let's fallback to existing if it exists, to be safe.
      finalImage = hero.skins[i].image;
    }

    finalSkins.push({
      name: skinInfo.name || `Skin ${skinIndex}`,
      image: finalImage
    });
  }

  logger.info(`[Skins] Saved ${finalSkins.length} skins for ${sourceName}`);
  return { skins: finalSkins };
}

async function processSkills(hero, sourceName, officialData, liquipediaData, wikiData, dryRun, logger) {
  const basePublicId = slugify(sourceName);

  // 1. Prepare Skill Builds (Liquipedia)
  let finalSkillBuilds = [];
  if (liquipediaData?.skillBuilds) {
    finalSkillBuilds = Object.entries(liquipediaData.skillBuilds).map(([formName, skills]) => ({
      name: formName === 'Default' ? 'Default' : formName,
      skills: skills
    }));
  }

  // 2. Select Skills Source (Official > Liquip > Wiki)
  // Fix: Ensure officialData.skills actually has valid content (names) before preferring it
  const hasValidOfficialSkills = officialData?.skills &&
    officialData.skills.length > 0 &&
    officialData.skills.some(s => s.name && s.name.trim().length > 0);

  let selectedSkills = hasValidOfficialSkills
    ? officialData.skills
    : ((liquipediaData?.allSkills && liquipediaData.allSkills.length > 0) ? liquipediaData.allSkills : (wikiData?.skills || hero.skills || []));

  // Patch names
  if (selectedSkills === officialData?.skills) {
    const fallbackSkills = liquipediaData?.allSkills || wikiData?.skills || [];
    selectedSkills = selectedSkills.map((s, i) => ({
      ...s,
      name: s.name || fallbackSkills[i]?.name || `Skill ${i + 1}`
    }));
  }

  // 3. Upload Icons
  let finalSkills = [];
  if (!dryRun && selectedSkills.length > 0) {
    try {
      finalSkills = await Promise.all(selectedSkills.map(async (s, i) => {
        let finalIcon = s.icon;
        if (s.icon && s.icon.startsWith('http')) {
          try {
            const skillSlug = s.name ? slugify(s.name) : `skill-${i}`;
            const skillPublicId = `${basePublicId}-skill-${skillSlug}`;
            // Check if it already looks like our cloudinary? Maybe skip if strict flag not set?
            // For now, consistent with previous logic: try upload
            const uploaded = await uploadImageFromUrl(s.icon, GAME_CONFIG.cloudinary.skills, skillPublicId);
            if (uploaded) finalIcon = uploaded;
          } catch (e) {
            logger.warn(`[Skills] Icon upload failed ${s.name}: ${e.message}`);
          }
        }
        return {
          name: s.name,
          icon: finalIcon,
          description: s.description,
          cooldown: s.cooldown,
          cost: s.cost
        };
      }));
    } catch (e) {
      logger.error(`[Skills] Error processing skills ${sourceName}: ${e.message}`);
      finalSkills = selectedSkills;
    }
  } else {
    finalSkills = selectedSkills;
  }

  // 4. Map Icons to Builds
  if (finalSkillBuilds.length > 0 && finalSkills.length > 0) {
    finalSkillBuilds = finalSkillBuilds.map(build => ({
      ...build,
      skills: build.skills.map(s => {
        const match = finalSkills.find(fs => fs.name === s.name || (slugify(fs.name) === slugify(s.name)));
        return {
          ...s,
          icon: match ? match.icon : s.icon
        };
      })
    }));
  }

  return {
    skills: finalSkills,
    skillBuilds: finalSkillBuilds
  };
}


async function processOfficialBuilds(hero, officialData, dryRun, logger) {
  const suits = officialData.strategyData?.suitStrategy || [];
  const itemBuilds = [];
  const arcanaBuilds = [];
  let suggestedEquipment = [];
  let suggestedArcana = [];

  // Check Data
  if (!officialData.strategyData) {
    logger.warn('[OfficialBuilds] No strategyData found in officialData');
  } else {
    logger.info(`[OfficialBuilds] strategyData found. suits: ${officialData.strategyData.suitStrategy?.length}`);
  }

  // Filter valid suits (must have suitStrategy) and take top 3
  const validSuits = suits.filter(s => s.suitStrategy).slice(0, 3);
  logger.info(`[OfficialBuilds] Processing ${validSuits.length} valid suits`);

  for (let i = 0; i < validSuits.length; i++) {
    const wrapper = validSuits[i];
    const suit = wrapper.suitStrategy;
    const buildName = `Build ${i + 1} (${wrapper.roleJobName || 'Official'})`;

    // --- EQUIPMENT ---
    const buildItemNames = [];
    const currentBuildRefs = [];
    if (suit.equips) {
      for (const eq of suit.equips) {
        if (!dryRun && eq.equipName) {
          try {
            // Upsert Equipment by Name/Slug
            const slug = slugify(eq.equipName);
            let equipDoc = await Equipment.findOne({ $or: [{ name: eq.equipName }, { slug: slug }] });

            if (!equipDoc) {
              const tierValue = GAME_CONFIG.equipmentTiers[eq.equipLevel] || 'Epic';

              equipDoc = await Equipment.create({
                name: eq.equipName,
                slug: slug,
                image: eq.equipIcon || '',
                description: eq.equipDesc || 'No description available',
                category: 'Physical', // Unknown default, maybe guess from attributes later?
                tier: tierValue,
                price: eq.equipPrice || 0
              });
              logger.info(`[Builds] Created New Equipment: ${eq.equipName} (Tier: ${tierValue})`);
            } else if (eq.equipIcon && (!equipDoc.image || equipDoc.image.length < 10)) {
              // Update icon if missing
              equipDoc.image = eq.equipIcon;
              await equipDoc.save();
            }

            if (equipDoc) {
              currentBuildRefs.push({ equipment: equipDoc._id, order: buildItemNames.length + 1 });
              logger.info(`[Builds] Eq Added: ${eq.equipName} (ID: ${equipDoc._id})`);
            } else {
              logger.warn(`[Builds] Eq Skipped (Doc Null): ${eq.equipName}`);
            }
          } catch (e) {
            logger.warn(`[Builds] Equip Upsert Error (${eq.equipName}): ${e.message}`);
          }
        }
        if (eq.equipName) buildItemNames.push(eq.equipName);
      }
    }
    if (buildItemNames.length > 0) {
      itemBuilds.push({ name: buildName, items: buildItemNames });
      // Add to suggestedEquipment (Flattened, with build index)
      currentBuildRefs.forEach(ref => {
        suggestedEquipment.push({ ...ref, build: i + 1 });
      });
    }

    // --- ARCANA ---
    const buildArcanaItems = [];
    const currentArcanaRefs = [];
    if (suit.runes) {
      for (const r of suit.runes) {
        if (!dryRun && r.runeName) {
          try {
            // FIX: Remove "Lvl 5: " prefix
            const cleanName = r.runeName.replace(/^(Lvl|Lv)\s*\d+\s*:\s*/i, '').trim();
            const slug = slugify(cleanName);
            let arcanaDoc = await Arcana.findOne({ $or: [{ name: cleanName }, { slug: slug }] });
            if (!arcanaDoc) {
              arcanaDoc = await Arcana.create({
                name: cleanName,
                slug: slug,
                image: r.runeIcon || '',
                description: r.runeDesc || '',
                color: GAME_CONFIG.arcanaColors[r.runeColor] || 'red',
                tier: r.runeLevel || GAME_CONFIG.defaults.arcanaTier
              });
              logger.info(`[Builds] Created New Arcana: ${cleanName}`);
            }

            if (arcanaDoc) {
              // Check if exists in set?
              // Official arcana format is List of 10? Or List of Types?
              // suit.runes seems to list UNIQUE runes with details? 
              // Wait, runeEffect in JSON was array of IDs [2520, 2520...].
              // suit.runes array seems to be definitions.
              // We need Counts.
              // Scan suit.runeIds or runeEffect?
              // Look at Step 1865 output: "runeIds": [ 1501, 1501... ]
              // So we must count IDs in `suit.runeIds`.
              // Then map `runeId` -> `runeName` using `suit.runes`.
            }
          } catch (e) { logger.warn(`[Builds] Arcana Upsert Error: ${e.message}`); }
        }
      }

      // Count Logic
      if (suit.runeIds) {
        logger.info(`[Builds] Counting ${suit.runeIds.length} rune IDs`);
        const counts = {};
        suit.runeIds.forEach(id => counts[id] = (counts[id] || 0) + 1);

        for (const [id, count] of Object.entries(counts)) {
          // Find definition in suit.runes
          const def = suit.runes.find(r => r.runeId == id);
          if (def) {
            const cleanName = def.runeName.replace(/^(Lvl|Lv)\s*\d+\s*:\s*/i, '').trim();
            const slug = slugify(cleanName);
            const arcanaDoc = await Arcana.findOne({ $or: [{ name: cleanName }, { slug: slug }] });
            if (arcanaDoc) {
              currentArcanaRefs.push({ arcana: arcanaDoc._id, count: count });
              logger.info(`[Builds] Arcana Added: ${cleanName} x${count}`);
            } else {
              logger.warn(`[Builds] Arcana Doc Not Found: ${cleanName}`);
            }
          } else {
            logger.warn(`[Builds] Arcana Definition Not Found for ID: ${id}`);
          }
        }
      }
    }

    if (currentArcanaRefs.length > 0) {
      arcanaBuilds.push({ name: `Arcana ${i + 1}`, items: currentArcanaRefs });
      if (i === 0) {
        suggestedArcana = currentArcanaRefs.map((ref, idx) => ({
          arcana: ref.arcana,
          note: `x${ref.count}`,
          order: idx + 1
        }));
      }
    }
  }

  return { itemBuilds, arcanaBuilds, suggestedEquipment, suggestedArcana };
}

async function processBuilds(hero, officialData, equipMap, arcanaMap, dryRun, logger) {
  // Debug
  logger.info(`[processBuilds] officialData Keys: ${Object.keys(officialData || {})}`);
  if (officialData?.strategyData) logger.info(`[processBuilds] strategyData Keys: ${Object.keys(officialData.strategyData)}`);

  // NEW: Check Strategy Data first
  if (officialData?.strategyData?.suitStrategy) {
    return await processOfficialBuilds(hero, officialData, dryRun, logger);
  }

  // Equipment
  let itemBuilds = [];
  let suggestedEquipment = hero.suggestedEquipment || [];

  if (officialData?.rawPresets?.equip && Array.isArray(officialData.rawPresets.equip)) {
    officialData.rawPresets.equip.slice(0, 3).forEach((buildItems, idx) => {
      if (Array.isArray(buildItems)) {
        const items = buildItems.map(item => item.equipName || item.item_name || '').filter(Boolean);
        if (items.length > 0) {
          itemBuilds.push({ name: `Build ${idx + 1}`, items });
          if (idx === 0) {
            suggestedEquipment = items.map((name, i) => {
              const eId = equipMap.get(slugify(name));
              return eId ? { equipment: eId, order: i + 1 } : null;
            }).filter(Boolean);
          }
        }
      }
    });
  }

  // Arcana
  let arcanaBuilds = [];
  let suggestedArcana = hero.suggestedArcana || [];

  if (officialData?.rawPresets?.arcana && Array.isArray(officialData.rawPresets.arcana)) {
    officialData.rawPresets.arcana.slice(0, 3).forEach((buildArcanas, idx) => {
      if (Array.isArray(buildArcanas)) {
        const counts = {};
        buildArcanas.forEach(a => {
          let name = a.inscriptionName || a.item_name;
          if (name) {
            name = name.replace(/^(Lvl|Lv)\s*\d+\s*:\s*/i, '').trim();
            counts[name] = (counts[name] || 0) + (a.cnt || 1);
          }
        });
        const buildItems = [];
        Object.entries(counts).forEach(([name, count]) => {
          const aId = arcanaMap.get(slugify(name));
          if (aId) buildItems.push({ arcana: aId, count: count });
        });

        if (buildItems.length > 0) {
          arcanaBuilds.push({ name: `Arcana Set ${idx + 1}`, items: buildItems });
          if (idx === 0) {
            suggestedArcana = buildItems.map((bi, i) => ({
              arcana: bi.arcana, note: `x${bi.count}`, order: i + 1
            }));
          }
        }
      }
    });
  }

  // Return clean data only, Raw data handled by caller
  return {
    itemBuilds,
    arcanaBuilds,
    suggestedEquipment,
    suggestedArcana
  };
}


// --- MAIN SERVICE ---

async function syncHoKMeta({
  scopes = ['all'],
  dryRun = false,
  logger = console,
  staticFile = null,
  directData = null,
  healForce = false
} = {}) {

  const nameMap = loadNameMap();
  logger.info(`[syncHoKMeta] Received directData: ${directData ? (Array.isArray(directData) ? `Array(${directData.length})` : typeof directData) : 'null/undefined'}`);
  let stats = directData;

  try {
    if (!stats) {
      const staticStats = await fetchHeroStatsFromStatic({ filePath: staticFile });
      if (staticStats && staticStats.length) stats = staticStats;
    }
  } catch (err) { logger.warn(`[syncHoKMeta] Static load error: ${err.message}`); }

  if (!stats || !Array.isArray(stats)) {
    throw new Error('No hero stats data available.');
  }

  // Pre-load Maps if needed
  let equipMap = new Map();
  let arcanaMap = new Map();
  if (scopes.includes('all') || scopes.includes('builds')) {
    try {
      const equips = await Equipment.find({}, 'name _id').lean();
      equips.forEach(e => equipMap.set(slugify(e.name), e._id));
      const arcanas = await Arcana.find({}, 'name _id').lean();
      arcanas.forEach(a => arcanaMap.set(slugify(a.name), a._id));
    } catch (e) { logger.warn('Failed to load Equipment/Arcana maps'); }
  }

  // Pre-load Heroes
  const heroes = await Hero.find({}, { _id: 1, name: 1, slug: 1, tier: 1, winRate: 1 }).lean();
  const bySlug = new Map();
  const byName = new Map();
  heroes.forEach(h => {
    bySlug.set(slugify(h.name), h);
    byName.set(h.name.toLowerCase(), h);
    if (h.slug) bySlug.set(String(h.slug).toLowerCase(), h);
  });

  let matched = 0, updated = 0;
  const unmatched = [];
  const { HeroDetailFetcher } = require('./heroDetailFetcher');
  const fetcher = new HeroDetailFetcher(logger);

  // Process List
  // OPTIMIZATION: Restored to 5 for GitHub Actions (2 vCPU/7GB RAM)
  const CONCURRENCY_LIMIT = 5;
  const processSingleHero = async (s) => {
    const rawName = s.name || s.heroName || s.heroInfo?.heroName;
    if (!rawName) {
      logger.warn(`[Sync] Skipped stat entry with no name (HeroID: ${s.heroId})`);
      return;
    }

    try {
      // Match Hero
      let hero = null;

      // Matching Logic
      const override = nameMap[rawName] || nameMap[slugify(rawName)];
      if (override) {
        const key = typeof override === 'string' ? override : (override.name || override.slug || '');
        if (key) hero = bySlug.get(slugify(key)) || byName.get(key.toLowerCase());
      }
      if (!hero) {
        hero = bySlug.get(slugify(rawName)) || byName.get(String(rawName).toLowerCase());
      }

      // Just-In-Time DB Check if not found in memory (for new creates in same run, or missed)
      if (!hero) {
        const existing = await Hero.findOne({ name: rawName });
        if (existing) {
          hero = existing.toObject();
        }
      }

      if (hero) matched++;

      let patchData = {};

      // --- 1. STATS SCOPE ---
      if (scopes.includes('all') || scopes.includes('stats') || !hero || scopes.includes('roles') || scopes.includes('lanes')) {
        const statsPatch = await processStats(hero || { name: rawName }, s, dryRun, logger, scopes);
        patchData = { ...patchData, ...statsPatch };
      }

      // --- FETCH DETAILED DATA IF NEEDED ---
      const needsDetails = scopes.includes('all') || scopes.includes('images') || scopes.includes('skills') || scopes.includes('builds') || scopes.includes('skins') || (!hero);

      let officialData = null, wikiData = null, liquipediaData = null;

      if (needsDetails) {
        const OfficialId = s.heroId;

        const IsDiscoveryMode = scopes.includes('images') || scopes.includes('skills') || scopes.includes('skins');

        if (healForce || !hero || scopes.length > 0) {
          try {
            // Block resources if we ONLY need stats/builds (Weekly Sync) -> Fast!
            // Unblock if we need Images/Skills (Discovery/Repair) -> Full render!
            officialData = OfficialId ? await fetcher.fetchOfficialData(OfficialId, { blockResources: !IsDiscoveryMode }) : null;

            // Only fetch wiki/liquipedia if we really need lore/skills/images
            if (scopes.includes('images') || scopes.includes('skills') || scopes.includes('lore')) {
              const [w, l] = await Promise.all([
                fetcher.fetchWikiData(rawName),
                fetcher.fetchLiquipediaData(rawName)
              ]);
              wikiData = w;
              liquipediaData = l;
            }
          } catch (e) {
            logger.warn(`Fetch error for ${rawName}: ${e.message}`);
          }
        }
      }

      // --- 2. COMMON DATA (Lanes/Roles) & LORE ---
      // CRITICAL: Remove 'all' to prevent overwriting unless explicit 'lore' scope
      if (!hero || scopes.includes('lore')) {
        if (liquipediaData || wikiData || officialData) {
          const destLanes = (liquipediaData?.lanes?.length) ? liquipediaData.lanes : (wikiData?.lane || []);
          const destRoles = (liquipediaData?.roles?.length) ? liquipediaData.roles : (wikiData?.class || []);

          if (scopes.includes('lanes') && destLanes.length) patchData.lanes = destLanes;
          if (scopes.includes('roles') && destRoles.length) patchData.roles = destRoles;

          // Only update title/slug on creation or explicit
          if (!hero) {
            patchData.title = liquipediaData?.title || wikiData?.title || officialData?.title || (hero?.title);
            patchData.slug = slugify(rawName);
          }

          const sourceLore = wikiData?.lore || liquipediaData?.lore || (officialData?.story || '');
          if (sourceLore && sourceLore.length > 10) {
            patchData.lore = sourceLore;
          }
        }
      }

      // --- 3. IMAGES SCOPE ---
      // CRITICAL: Remove 'all', requires explicit 'images'
      if (scopes.includes('images') || !hero) {
        try {
          const imgPatch = await processImages(hero || {}, rawName, officialData, s.heroId, liquipediaData, wikiData, dryRun, logger);
          patchData = { ...patchData, ...imgPatch };
        } catch (e) {
          logger.error(`[Sync] Image processing failed for ${rawName}: ${e.message}`);
        }
      }

      // --- 3.5 SKINS IMAGES SCOPE ---
      // CRITICAL: Remove 'all', requires explicit 'skins'
      if ((scopes.includes('skins')) && s.heroId) {
        try {
          const skinPatch = await processSkins(hero || {}, rawName, s.heroId, liquipediaData, wikiData, dryRun, logger);
          patchData = { ...patchData, ...skinPatch };
        } catch (e) {
          logger.error(`[Sync] Skin processing failed for ${rawName}: ${e.message}`);
        }
      }

      // --- 4. SKILLS SCOPE ---
      // CRITICAL: Remove 'all', requires explicit 'skills'
      if ((scopes.includes('skills') || !hero) && (officialData || liquipediaData)) {
        const skillPatch = await processSkills(hero || {}, rawName, officialData, liquipediaData, wikiData, dryRun, logger);
        patchData = { ...patchData, ...skillPatch }; // Fixed: Was waiting but not assigning
      }

      // --- 5. BUILDS SCOPE ---
      if ((scopes.includes('all') || scopes.includes('builds')) && officialData) {
        const buildPatch = await processBuilds(hero || {}, officialData, equipMap, arcanaMap, dryRun, logger);
        patchData = { ...patchData, ...buildPatch };
      }

      // --- SAVE TO DB ---
      if (!dryRun) {
        let savedHero = null;
        if (hero) {
          // Update
          if (Object.keys(patchData).length > 0) {
            savedHero = await Hero.findByIdAndUpdate(hero._id, { $set: patchData }, { new: true });
            updated++;
            logger.info(`[Sync] Updated ${rawName} [Scopes: ${scopes}]`);
          } else {
            savedHero = hero;
          }
        } else {
          // Create
          patchData.name = rawName;
          patchData.slug = slugify(rawName);
          savedHero = await Hero.create(patchData);
          updated++;
          logger.info(`[Sync] Created ${rawName}`);
        }

        // --- SAVE RAW DATA ---
        if (savedHero && (officialData || liquipediaData || wikiData)) {
          try {
            const rawPayload = {
              hero: savedHero._id,
              slug: savedHero.slug,
              updatedAt: new Date()
            };
            if (officialData) rawPayload.officialData = officialData;
            if (liquipediaData) rawPayload.wikiData = liquipediaData;
            if (officialData?.rawPresets) rawPayload.rawPresets = officialData.rawPresets;
            if (officialData?.strategyData) rawPayload.strategyData = officialData.strategyData;

            await HeroRaw.findOneAndUpdate(
              { hero: savedHero._id },
              { $set: rawPayload },
              { upsert: true, new: true }
            );
            // logger.info(`[Sync] Updated HeroRaw for ${rawName}`); // Noise reduction
          } catch (e) {
            logger.error(`[Sync] Failed to save HeroRaw for ${rawName}: ${e.message}`);
          }
        }
      }
    } catch (err) {
      logger.error(`[Sync] Critical error processing ${rawName}: ${err.message}`);
    }
  };

  // Execute in batches
  logger.info(`[Sync] Starting batch processing with concurrency ${CONCURRENCY_LIMIT}...`);
  for (let i = 0; i < stats.length; i += CONCURRENCY_LIMIT) {
    const batch = stats.slice(i, i + CONCURRENCY_LIMIT);
    logger.info(`[Sync] Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}/${Math.ceil(stats.length / CONCURRENCY_LIMIT)} (${batch.length} heroes)`);

    await Promise.all(batch.map(s => processSingleHero(s)));

    // Optional: Small delay between batches to be gentle on APIs if needed
    // await new Promise(r => setTimeout(r, 500)); 
  }

  // Update SiteInfo timestamp
  if (!dryRun) {
    try {
      await SiteInfo.findOneAndUpdate(
        { key: 'heroes_meta_updated' },
        { key: 'heroes_meta_updated', updatedAt: new Date() },
        { upsert: true, new: true }
      );
      logger.info('[Sync] Updated heroes_meta_updated timestamp.');
    } catch (e) {
      logger.error(`[Sync] Failed to update timestamp: ${e.message}`);
    }
  }

  return { matched, updated };
}

module.exports = { syncHoKMeta };
