const fs = require('fs');
const path = require('path');

function pct100(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  // Heuristic: If value > 1, assume it is already a percentage (e.g. 51.5)
  // If value <= 1, assume it is a ratio (e.g. 0.515) and scale it
  if (n > 1) {
    return Math.round(n * 100) / 100;
  }
  return Math.round(n * 10000) / 100; // 2 decimals
}
function mapTierFromTRank(tRank) {
  const n = Number(tRank);
  switch (n) {
    case 0: return 'S';
    case 1: return 'A';
    case 2: return 'B';
    case 3: return 'C';
    default: return 'A';
  }
}

function normalize(data) {
  const list = Array.isArray(data) ? data
    : Array.isArray(data.list) ? data.list
      : Array.isArray(data.data && data.data.list) ? data.data.list
        : Array.isArray(data.result) ? data.result
          : [];
  return list.map(item => ({
    name: item?.heroInfo?.heroName || item?.heroName || '',
    winRate: pct100(item?.winRate),
    pickRate: pct100(item?.showRate),
    banRate: pct100(item?.banRate),
    metaTier: mapTierFromTRank(item?.tRank),
    heroId: item?.heroInfo?.heroId || item?.heroId,
    position: item?.position,
    heroInfo: item?.heroInfo,
    raw: item
  })).filter(x => x.name);
}

/**
 * Load hero stats from a static JSON string or file.
 * Env support:
 * - HOK_RANKLIST_INLINE_JSON (raw JSON string)
 * - HOK_RANKLIST_JSON_FILE (relative path from server dir)
 */
async function fetchHeroStatsFromStatic({ json, filePath: file, data: directData } = {}) {
  if (directData) return normalize(directData);
  let source = json;
  console.log('[DEBUG] Env HOK_RANKLIST_JSON_FILE:', process.env.HOK_RANKLIST_JSON_FILE);
  if (!source && !file) {
    if (process.env.HOK_RANKLIST_INLINE_JSON) {
      source = process.env.HOK_RANKLIST_INLINE_JSON;
    } else if (process.env.HOK_RANKLIST_JSON_FILE) {
      file = process.env.HOK_RANKLIST_JSON_FILE;
    }
  }
  console.log('[DEBUG] File to load:', file);
  if (!source && file) {
    const abs = path.isAbsolute(file)
      ? file
      : path.join(__dirname, '..', file.replace(/^\.\//, ''));
    console.log('[DEBUG] Absolute path:', abs);
    try {
      source = fs.readFileSync(abs, 'utf8');
      console.log('[DEBUG] File read success, length:', source.length);
    } catch (err) {
      console.log('[DEBUG] File read error:', err.message);
    }
  }
  if (!source) return null;
  let data;
  try {
    data = JSON.parse(source);
    console.log('[DEBUG] JSON parsed, type:', Array.isArray(data) ? 'Array' : typeof data);
  } catch (e) {
    throw new Error('Invalid JSON for ranklist static source');
  }
  const norm = normalize(data);
  console.log('[DEBUG] Normalized length:', norm.length);
  return norm;
}

module.exports = { fetchHeroStatsFromStatic };
