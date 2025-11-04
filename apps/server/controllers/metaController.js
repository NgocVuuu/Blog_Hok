const Meta = require('../models/Meta');
const Hero = require('../models/Hero');

exports.getAllMeta = async (req, res, next) => {
  try {
  // Populate heroes list (field is 'heroes' in schema)
  const meta = await Meta.find().populate('heroes');
    res.json(meta);
  } catch (err) {
    next(err);
  }
};

exports.createMeta = async (req, res, next) => {
  try {
    const meta = new Meta(req.body);
    const newMeta = await meta.save();
    res.status(201).json(newMeta);
  } catch (err) {
    next(err);
  }
};

// -------------------- Special Trending Heroes --------------------
// Simple in-memory cache to avoid recomputing too often
let specialTrendingCache = {
  key: null,
  at: 0,
  data: null
};

// Helper: normalize text for keyword matching (remove accents, lowercase)
function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Category definitions with keywords (EN + VI)
const CATEGORY_DEFS = [
  { key: 'anti_heal', labelEn: 'Anti-heal', labelVi: 'Chống hồi phục', kw: ['anti-heal','anti heal','grievous','reduce healing','giam hoi mau','cat hoi mau','khac hoi mau'] },
  { key: 'true_damage', labelEn: 'True Damage', labelVi: 'Sát thương chuẩn', kw: ['true damage','sat thuong chuan'] },
  { key: 'execute', labelEn: 'Execute', labelVi: 'Kết liễu', kw: ['execute','ket lieu','cull','finishers'] },
  { key: 'shield_break', labelEn: 'Shield Break', labelVi: 'Phá khiên', kw: ['shield break','break shield','pha khien','giam khien'] },
  { key: 'stealth', labelEn: 'Stealth', labelVi: 'Tàng hình', kw: ['stealth','invisible','tang hinh'] },
  { key: 'global', labelEn: 'Global Impact', labelVi: 'Ảnh hưởng toàn bản đồ', kw: ['global','toan ban do','teleport','dich chuyen'] },
  { key: 'hook_pull', labelEn: 'Hook/Pull', labelVi: 'Kéo/Hút', kw: ['hook','pull','keo','hut'] },
  { key: 'revive', labelEn: 'Revive', labelVi: 'Hồi sinh', kw: ['revive','resurrect','hoi sinh'] },
  { key: 'silence', labelEn: 'Silence', labelVi: 'Câm lặng', kw: ['silence','cam lang','cam'] },
  { key: 'stun_chain', labelEn: 'Stun Chain', labelVi: 'Khống chế dồn', kw: ['stun','choang','lam choang'] },
  { key: 'dash_mobility', labelEn: 'High Mobility', labelVi: 'Cơ động cao', kw: ['dash','blink','luot','nhay','toc bien'] },
  { key: 'percent_hp', labelEn: 'Percent Health Damage', labelVi: 'Sát thương theo % máu', kw: ['max health','percent health','% health','% mau','% sat thuong','theo phan tram mau','sat thuong theo mau'] },
  { key: 'sustain', labelEn: 'Sustain', labelVi: 'Tự hồi phục', kw: ['lifesteal','spell vamp','hut mau','hut phep','hoi phuc','tu hoi mau'] },
  { key: 'zone_control', labelEn: 'Zone Control', labelVi: 'Kiểm soát khu vực', kw: ['zone','area denial','vung cam','lam cham dien rong','lam cham','slow field'] },
  { key: 'burst', labelEn: 'Burst', labelVi: 'Dồn sát thương', kw: ['burst','don sat thuong','sat thuong don'] },
  { key: 'poke', labelEn: 'Poke', labelVi: 'Cấu rỉa', kw: ['poke','cau ria','cau mau'] },
  { key: 'displacement', labelEn: 'Displacement', labelVi: 'Hất/Đẩy', kw: ['knock','hat tung','day lui','hat vang'] },
  { key: 'cleanse_immunity', labelEn: 'Cleanse/Immunity', labelVi: 'Kháng hiệu ứng', kw: ['cleanse','immunity','khang hieu ung','mien nhiem'] },
  { key: 'pet_clone', labelEn: 'Pet/Clone', labelVi: 'Phân thân/Đệ', kw: ['clone','shadow','bong','de','pet'] }
];

function tierMultiplier(tier) {
  return ({ 'S+': 1.2, 'S': 1.15, 'A': 1.1, 'B': 1.0, 'C': 0.9 }[tier] || 1.05);
}

function computeWindowKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0..11
  const quarter = Math.floor(m / 3) + 1; // Q1..Q4
  const monthInQuarter = m % 3; // 0..2
  const windowIndex = monthInQuarter + 1; // 1..3 -> 3 times per season (quarter)
  return `${y}Q${quarter}-W${windowIndex}`;
}

exports.getSpecialTrending = async (req, res, next) => {
  try {
    const key = computeWindowKey();
    // Cache for 30 minutes if same window
    if (specialTrendingCache.key === key && Date.now() - specialTrendingCache.at < 30 * 60 * 1000 && specialTrendingCache.data) {
      return res.json({ success: true, window: { id: key }, data: specialTrendingCache.data });
    }

    // Fetch minimal hero fields
    const heroes = await Hero.find({}, {
      name: 1, slug: 1, image: 1, roles: 1, metaTier: 1, winRate: 1, pickRate: 1, banRate: 1, skills: 1
    }).lean();

    // Score heroes per category and overall
    const scored = heroes.map(h => {
      const text = normalize([
        h.name,
        ...(Array.isArray(h.skills) ? h.skills.map(s => `${s.name || ''} ${s.description || ''}`) : [])
      ].join(' '));

      const matches = CATEGORY_DEFS.map(cat => ({
        key: cat.key,
        labelEn: cat.labelEn,
        labelVi: cat.labelVi,
        hits: cat.kw.some(k => text.includes(k)) ? 1 : 0
      })).filter(m => m.hits > 0);

      const specialtyScore = matches.reduce((acc, m) => acc + (m.hits || 0), 0);
      const wr = Number(h.winRate || 0);
      const pr = Number(h.pickRate || 0);
      const br = Number(h.banRate || 0);
      const viability = 1
        + (wr - 50) / 100 * 1.5
        + pr / 100 * 0.5
        + br / 100 * 0.4;
      const tierMul = tierMultiplier(h.metaTier);
      const total = specialtyScore * viability * tierMul;

      // Choose primary category for reason
  const primaryCat = matches[0] || null;
      return {
        hero: h,
        total,
        specialtyScore,
        primaryCat
      };
    }).filter(x => x.specialtyScore > 0);

    // Build category-wise picks for variety
    const byCategory = new Map();
    CATEGORY_DEFS.forEach(c => byCategory.set(c.key, []));
    scored.forEach(s => {
      if (s.primaryCat) {
        const arr = byCategory.get(s.primaryCat.key) || [];
        arr.push(s);
        byCategory.set(s.primaryCat.key, arr);
      }
    });
    for (const [k, arr] of byCategory) {
      arr.sort((a, b) => b.total - a.total);
    }

    const picks = [];
    const seen = new Set();
    const roleCount = new Map();
    const pushPick = (s) => {
      if (!s || seen.has(s.hero._id.toString())) return false;
      const role = Array.isArray(s.hero.roles) && s.hero.roles.length ? s.hero.roles[0] : 'ANY';
      const count = roleCount.get(role) || 0;
      if (count >= 2) return false; // avoid stacking single role
      seen.add(s.hero._id.toString());
      roleCount.set(role, count + 1);
      picks.push(s);
      return true;
    };

    // First pass: best per category (up to 1 each)
    for (const [k, arr] of byCategory) {
      if (arr && arr.length) pushPick(arr[0]);
      if (picks.length >= 6) break;
    }

    // Second pass: fill remaining by overall score
    scored.sort((a, b) => b.total - a.total);
    for (const s of scored) {
      if (picks.length >= 6) break;
      pushPick(s);
    }

    // Compose output
  // Category narratives (standalone sentence if role not available)
  const REASONS = {
      anti_heal: {
        vi: 'Giảm mạnh khả năng hồi phục của đối thủ, khắc chế các kèo hút và regen.',
        en: 'Severely cuts enemy sustain, countering lifesteal and regeneration.'
      },
      true_damage: {
        vi: 'Sát thương chuẩn xuyên giáp/kháng phép, hiệu quả trước mục tiêu trâu bò.',
        en: 'True damage bypasses armor/resistance, ideal versus tanky targets.'
      },
      execute: {
        vi: 'Kết liễu mục tiêu thấp máu an toàn, buộc đối thủ chơi thủ hơn.',
        en: 'Securely executes low-HP targets, forcing safer enemy play.'
      },
      shield_break: {
        vi: 'Phá lớp khiên nhanh, mạnh trước đội hình nhiều khiên/buff.',
        en: 'Breaks shields quickly, great versus shield-heavy comps.'
      },
      stealth: {
        vi: 'Tàng hình giúp tiếp cận hoặc rút lui khó đoán, tạo đột biến.',
        en: 'Stealth enables unpredictable engages or escapes.'
      },
      global: {
        vi: 'Chiêu thức toàn bản đồ tạo áp lực liên tục và hỗ trợ đảo đường.',
        en: 'Global presence pressures lanes and enables constant cross-map impact.'
      },
      hook_pull: {
        vi: 'Kéo/Hút bắt lẻ mục tiêu, dễ lật kèo trong giao tranh.',
        en: 'Hooks/pulls isolate targets, swinging teamfights.'
      },
      revive: {
        vi: 'Hồi sinh cho phép chơi mạo hiểm và câu tài nguyên đối thủ.',
        en: 'Revive permits riskier plays and baits enemy resources.'
      },
      silence: {
        vi: 'Câm lặng khóa kỹ năng chủ lực, triệt tiêu khả năng phản ứng.',
        en: 'Silence shuts down key skills and counterplay.'
      },
      stun_chain: {
        vi: 'Chuỗi choáng giữ chân mục tiêu lâu, dễ phối hợp dồn sát thương.',
        en: 'Stun chains lock targets down for coordinated burst.'
      },
      dash_mobility: {
        vi: 'Cơ động cao để outplay và kiểm soát nhịp giao tranh.',
        en: 'High mobility to outplay and control the fight tempo.'
      },
      percent_hp: {
        vi: 'Sát thương theo % máu cực hiệu quả trước tanker/hyper HP.',
        en: 'Percent-HP damage excels against tanks and high-HP foes.'
      },
      sustain: {
        vi: 'Tự hồi phục tốt, trụ đường bền bỉ và giao tranh dài hơi.',
        en: 'Great self-sustain for laning and prolonged skirmishes.'
      },
      zone_control: {
        vi: 'Kiểm soát khu vực, chặn đường tiếp cận và tranh chấp mục tiêu.',
        en: 'Controls zones to block engages and contest objectives.'
      },
      burst: {
        vi: 'Sát thương dồn mạnh, hạ gục mục tiêu mỏng trong chớp mắt.',
        en: 'Massive burst to delete squishies instantly.'
      },
      poke: {
        vi: 'Cấu rỉa tầm xa bào máu trước khi mở giao tranh.',
        en: 'Long-range poke softens enemies before engaging.'
      },
      displacement: {
        vi: 'Đẩy/Hất văng để tách đội hình và bảo vệ tuyến sau.',
        en: 'Displacement splits enemy formations and protects backline.'
      },
      cleanse_immunity: {
        vi: 'Kháng/giải hiệu ứng giúp an toàn trước khống chế cứng.',
        en: 'Cleanse/immunity keeps you safe from heavy CC.'
      },
      pet_clone: {
        vi: 'Phân thân/đệ tạo áp lực liên tục và gây nhiễu giao tranh.',
        en: 'Clones/pets add constant pressure and teamfight confusion.'
      }
    };
    // Short category nouns to compose with role leads (for "nhờ ...")
    const CAT_NOUNS = {
      vi: {
        anti_heal: 'khả năng chống hồi phục',
        true_damage: 'sát thương chuẩn',
        execute: 'khả năng kết liễu',
        shield_break: 'khả năng phá khiên',
        stealth: 'tàng hình',
        global: 'tầm ảnh hưởng toàn bản đồ',
        hook_pull: 'kỹ năng kéo/hút',
        revive: 'khả năng hồi sinh',
        silence: 'câm lặng',
        stun_chain: 'chuỗi khống chế',
        dash_mobility: 'độ cơ động cao',
        percent_hp: 'sát thương theo % máu',
        sustain: 'khả năng tự hồi phục',
        zone_control: 'kiểm soát khu vực',
        burst: 'sát thương dồn',
        poke: 'cấu rỉa tầm xa',
        displacement: 'khả năng hất/đẩy',
        cleanse_immunity: 'kháng/giải hiệu ứng',
        pet_clone: 'phân thân/đệ'
      },
      en: {
        anti_heal: 'anti-heal',
        true_damage: 'true damage',
        execute: 'execute finishers',
        shield_break: 'shield breaking',
        stealth: 'stealth',
        global: 'global presence',
        hook_pull: 'hooks/pulls',
        revive: 'revive',
        silence: 'silence',
        stun_chain: 'stun chains',
        dash_mobility: 'high mobility',
        percent_hp: 'percent-HP damage',
        sustain: 'self-sustain',
        zone_control: 'zone control',
        burst: 'burst damage',
        poke: 'long-range poke',
        displacement: 'displacement',
        cleanse_immunity: 'cleanse/immunity',
        pet_clone: 'clones/pets'
      }
    };

    // Role leads to sound natural, pick first role if available
    const ROLE_LEAD = {
      vi: {
        support: 'Hỗ trợ mở giao tranh tốt',
        tank: 'Tuyến trước vững và mở giao tranh ổn định',
        assassin: 'Ám sát chủ lực nhanh',
        mage: 'Pháp sư gây áp lực tầm xa',
        marksman: 'Xạ thủ gây sát thương ổn định',
        warrior: 'Đấu sĩ đột phá giao tranh',
        jungler: 'Đi rừng kiểm soát mục tiêu tốt',
        roam: 'Hỗ trợ đảo đường hiệu quả'
      },
      en: {
        support: 'Engages well as support',
        tank: 'Reliable frontline engage',
        assassin: 'Quickly deletes backline',
        mage: 'Long-range pressure mage',
        marksman: 'Consistent DPS marksman',
        warrior: 'Skirmish-ready fighter',
        jungler: 'Objective-controlling jungler',
        roam: 'Effective roamer'
      }
    };

    const normalizeRole = (arr) => {
      const raw = (Array.isArray(arr) && arr[0]) ? String(arr[0]).toLowerCase() : '';
      if (/support/.test(raw)) return 'support';
      if (/tank|guardian/.test(raw)) return 'tank';
      if (/assassin/.test(raw)) return 'assassin';
      if (/mage|wizard/.test(raw)) return 'mage';
      if (/marksman|adc|archer/.test(raw)) return 'marksman';
      if (/warrior|fighter|bruiser/.test(raw)) return 'warrior';
      if (/jung/.test(raw)) return 'jungler';
      if (/roam/.test(raw)) return 'roam';
      return '';
    };

    const toReason = (lang, s) => {
      const key = s.primaryCat && s.primaryCat.key;
      const roleKey = normalizeRole(s.hero.roles);
      const roleLead = roleKey ? ROLE_LEAD[lang][roleKey] : '';
      const noun = key ? (CAT_NOUNS[lang][key] || (lang === 'vi' ? (s.primaryCat.labelVi || '').toLowerCase() : (s.primaryCat.labelEn || '').toLowerCase())) : '';
      if (roleLead && noun) {
        return lang === 'vi' ? `${roleLead} nhờ ${noun}.` : `${roleLead} with ${noun}.`;
      }
      // Fallback to standalone category narrative
      const pack = key ? REASONS[key] : null;
      if (pack) return lang === 'vi' ? pack.vi : pack.en;
      return lang === 'vi'
        ? 'Bộ kỹ năng độc đáo, phù hợp với meta hiện tại.'
        : 'Unique kit that fits the current meta.';
    };

    const data = picks.slice(0, 6).map(s => ({
      id: s.hero._id,
      name: s.hero.name,
      slug: s.hero.slug,
      image: s.hero.image,
      metaTier: s.hero.metaTier,
      winRate: s.hero.winRate,
      pickRate: s.hero.pickRate,
  categoryEn: s.primaryCat ? s.primaryCat.labelEn : 'Special',
  categoryVi: s.primaryCat ? s.primaryCat.labelVi : 'Đặc biệt',
  reasonEn: toReason('en', s),
  reasonVi: toReason('vi', s),
  // Backward compatible fields (now English only)
  category: s.primaryCat ? s.primaryCat.labelEn : 'Special',
  reason: toReason('en', s)
    }));

    specialTrendingCache = { key, at: Date.now(), data };
    res.json({ success: true, window: { id: key }, data });
  } catch (err) {
    next(err);
  }
};

exports.updateMeta = async (req, res, next) => {
  try {
    const meta = await Meta.findById(req.params.id);
    if (!meta) return res.status(404).json({ message: 'Không tìm thấy meta' });
    Object.assign(meta, req.body);
    const updatedMeta = await meta.save();
    res.json(updatedMeta);
  } catch (err) {
    next(err);
  }
};

exports.deleteMeta = async (req, res, next) => {
  try {
    const meta = await Meta.findById(req.params.id);
    if (!meta) return res.status(404).json({ message: 'Không tìm thấy meta' });
    await meta.remove();
    res.json({ message: 'Đã xóa meta' });
  } catch (err) {
    next(err);
  }
}; 