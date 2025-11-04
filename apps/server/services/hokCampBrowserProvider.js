/*
  Browser fallback using Puppeteer to open the hero-hot-list page and capture getranklist XHR.
*/
const puppeteer = require('puppeteer');

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

async function fetchHeroStatsViaBrowser({ pageUrl, timeoutMs = 20000 } = {}) {
  const url = pageUrl || process.env.HOK_BROWSER_PAGE_URL || 'https://camp.honorofkings.com/h5/app/index.html#/hero-hot-list';
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      if (['image','font','media','stylesheet'].includes(type)) {
        return req.abort();
      }
      req.continue();
    });

    let captured = null;
    page.on('response', async (res) => {
      try {
        const u = res.url();
        if (u.includes('getranklist')) {
          const ct = res.headers()['content-type'] || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            captured = data;
          } else {
            const text = await res.text();
            try { captured = JSON.parse(text); } catch { /*ignore*/ }
          }
        }
      } catch { /* ignore */ }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    // Try to wait until we have captured data or timeout
    const start = Date.now();
    while (!captured && Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 300));
    }

    if (!captured) throw new Error('Unable to capture getranklist data');

    const list = Array.isArray(captured) ? captured
      : Array.isArray(captured.list) ? captured.list
      : Array.isArray(captured.data && captured.data.list) ? captured.data.list
      : Array.isArray(captured.result) ? captured.result
      : [];
    const normalized = list.map(item => ({
      name: item?.heroInfo?.heroName || item?.heroName || '',
      winRate: pct100(item?.winRate),
      pickRate: pct100(item?.showRate),
      banRate: pct100(item?.banRate),
      metaTier: mapTierFromTRank(item?.tRank),
      raw: item
    })).filter(x => x.name);
    return normalized;
  } finally {
    try { await browser.close(); } catch {}
  }
}

module.exports = { fetchHeroStatsViaBrowser };
