const mongoose = require('mongoose');
const Hero = require('../models/Hero');
const { fetchHeroStatsFromStatic } = require('./hokStaticProvider');
const fs = require('fs');
const path = require('path');

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
  } catch (e) {
    // ignore
  }
  return {};
}

async function syncHoKMeta({ dryRun = false, logger = console } = {}) {
  const nameMap = loadNameMap();
  let stats;
  try {
    // Only use static JSON source (env: HOK_RANKLIST_INLINE_JSON or HOK_RANKLIST_JSON_FILE)
    const staticStats = await fetchHeroStatsFromStatic({});
    if (staticStats && staticStats.length) stats = staticStats;
  } catch (err) {
    throw err;
  }
  if (!stats || !stats.length) throw new Error('Không tìm thấy dữ liệu JSON tĩnh. Hãy cấu hình HOK_RANKLIST_JSON_FILE hoặc HOK_RANKLIST_INLINE_JSON.');
  if (!Array.isArray(stats) || stats.length === 0) {
    return { updated: 0, matched: 0, missing: stats.length || 0, unmatched: [] };
  }

  const heroes = await Hero.find({}, { _id: 1, name: 1, slug: 1 }).lean();
  const bySlug = new Map();
  const byName = new Map();
  heroes.forEach(h => {
    bySlug.set(slugify(h.name), h);
    byName.set(h.name.toLowerCase(), h);
    if (h.slug) bySlug.set(String(h.slug).toLowerCase(), h);
  });

  let matched = 0;
  let updated = 0;
  const unmatched = [];

  for (const s of stats) {
    const rawName = s.name;
    const override = nameMap[rawName] || nameMap[slugify(rawName)] || null;
    const candidates = [];
    if (override) {
      const key = typeof override === 'string' ? override : (override.name || override.slug || '');
      if (key) {
        const by = bySlug.get(slugify(key)) || byName.get(key.toLowerCase());
        if (by) candidates.push(by);
      }
    }
    if (candidates.length === 0) {
      const m = bySlug.get(slugify(rawName)) || byName.get(String(rawName).toLowerCase());
      if (m) candidates.push(m);
    }

    const hero = candidates[0];
    if (!hero) {
      unmatched.push({ sourceName: rawName, stats: s });
      continue;
    }
    matched += 1;

    const patch = {
      metaTier: s.metaTier,
      winRate: s.winRate,
      pickRate: s.pickRate,
      banRate: s.banRate,
    };
    if (dryRun) {
      logger.log(`[DRY] Would update ${hero.name} (${hero._id}) =>`, patch);
      continue;
    }
    const res = await Hero.updateOne({ _id: hero._id }, { $set: patch });
    if (res && res.modifiedCount > 0) updated += 1;
  }

  return { matched, updated, missing: stats.length - matched, unmatched };
}

module.exports = { syncHoKMeta };
