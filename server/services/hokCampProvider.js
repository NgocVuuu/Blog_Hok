/*
  Provider to fetch hero meta stats from Honor of Kings Camp "getranklist" endpoint.
  Configure the full URL via env HOK_RANKLIST_URL (copied from Network tab).
  Optionally provide extra headers JSON via HOK_RANKLIST_HEADERS (stringified JSON),
  or the provider will use reasonable defaults.
*/

const axios = require('axios');

function pct100(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
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

/**
 * Fetch hero stats from getranklist endpoint
 * @param {Object} opts
 * @param {string} [opts.url] - Full URL. Defaults to process.env.HOK_RANKLIST_URL
 * @param {Object} [opts.headers] - Extra headers to merge
 * @returns {Promise<Array<{name:string, winRate:number, pickRate:number, banRate:number, metaTier:string, raw:any}>>}
 */
async function fetchHeroStatsFromRankList(opts = {}) {
  const url = opts.url || process.env.HOK_RANKLIST_URL;
  if (!url) {
    throw new Error('HOK_RANKLIST_URL is not set');
  }
  const method = (process.env.HOK_RANKLIST_METHOD || 'GET').toUpperCase();
  let body = undefined;
  try {
    if (process.env.HOK_RANKLIST_BODY) {
      body = JSON.parse(process.env.HOK_RANKLIST_BODY);
    }
  } catch (e) {
    // ignore invalid json body
  }
  let extraHeaders = {};
  try {
    if (process.env.HOK_RANKLIST_HEADERS) {
      extraHeaders = JSON.parse(process.env.HOK_RANKLIST_HEADERS);
    }
  } catch (e) {
    // ignore invalid json
  }

  const headers = Object.assign(
    {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://camp.honorofkings.com/',
      'Origin': 'https://camp.honorofkings.com'
    },
    opts.headers || {},
    extraHeaders
  );

  const client = axios.create({ timeout: 15000, headers });
  // Simple retry (3 attempts)
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = method === 'POST' ? await client.post(url, body) : await client.get(url);
      const data = res && res.data;
      if (!data) throw new Error('Empty response');

      // Try common shapes: data.list, data.data.list, data.result, or array
      const list = Array.isArray(data) ? data
        : Array.isArray(data.list) ? data.list
        : Array.isArray(data.data && data.data.list) ? data.data.list
        : Array.isArray(data.result) ? data.result
        : [];
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('No hero list found in response');
      }
      const normalized = list.map(item => {
        const name = item?.heroInfo?.heroName || item?.heroName || '';
        const winRate = pct100(item?.winRate);
        const pickRate = pct100(item?.showRate);
        const banRate = pct100(item?.banRate);
        const metaTier = mapTierFromTRank(item?.tRank);
        return {
          name,
          winRate,
          pickRate,
          banRate,
          metaTier,
          raw: item
        };
      });
      return normalized.filter(x => x.name);
    } catch (err) {
      lastErr = err;
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 500));
    }
  }
  throw lastErr || new Error('Failed to fetch rank list');
}

module.exports = {
  fetchHeroStatsFromRankList,
};
