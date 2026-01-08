const Hero = require('../models/Hero');
const mongoose = require('mongoose');

exports.getAllHeroes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      lane,
      metaTier,
      sort = 'name'
    } = req.query;

    // Build query
    let query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by role
    if (role && role !== 'all') {
      query.roles = { $in: [role] };
    }

    // Filter by lane
    if (lane && lane !== 'all') {
      query.lanes = { $in: [lane] };
    }

    // Filter by meta tier
    if (metaTier && metaTier !== 'all') {
      query.metaTier = metaTier;
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'name':
        sortCriteria = { name: 1 };
        break;
      case 'winRate':
        sortCriteria = { winRate: -1 };
        break;
      case 'pickRate':
        sortCriteria = { pickRate: -1 };
        break;
      case 'metaTier':
        sortCriteria = { metaTier: 1, winRate: -1 };
        break;
      default:
        sortCriteria = { name: 1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute queries in parallel
    const [heroes, total] = await Promise.all([
      Hero.find(query)
        .select('name title image bannerImage roles lanes metaTier winRate pickRate banRate slug')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .maxTimeMS(10000),
      Hero.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: heroes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (err) {
    console.error('Error in getAllHeroes:', err);
    next(err);
  }
};

exports.getHeroById = async (req, res, next) => {
  try {
    // Extract the MongoDB ID part before any colon if present
    const idPart = req.params.id.split(':')[0];

    // Check if the ID format is valid
    if (!mongoose.Types.ObjectId.isValid(idPart)) {
      return res.status(400).json({ message: 'ID tướng không hợp lệ' });
    }

    const hero = await Hero.findById(idPart)
      .populate({ path: 'suggestedArcana.arcana', select: 'name image color tier' })
      .populate({ path: 'suggestedEquipment.equipment', select: 'name image category tier price' })
      .populate({ path: 'arcanaBuilds.items.arcana', select: 'name image color tier attributes' });
    if (!hero) return res.status(404).json({ message: 'Không tìm thấy tướng' });
    const heroObj = hero.toObject();
    if (Array.isArray(heroObj.suggestedArcana)) {
      heroObj.suggestedArcana = heroObj.suggestedArcana
        .filter(i => i && i.arcana)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(i => ({
          _id: i.arcana._id,
          name: i.arcana.name,
          image: i.arcana.image,
          color: i.arcana.color,
          tier: i.arcana.tier,
          note: i.note || '',
          order: i.order || 0
        }));
    }
    if (Array.isArray(heroObj.suggestedEquipment)) {
      heroObj.suggestedEquipment = heroObj.suggestedEquipment
        .filter(i => i && i.equipment)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(i => ({
          _id: i.equipment._id,
          name: i.equipment.name,
          image: i.equipment.image,
          category: i.equipment.category,
          tier: i.equipment.tier,
          price: i.equipment.price,
          note: i.note || '',
          order: i.order || 0,
          build: typeof i.build === 'number' ? i.build : 1
        }));
    }
    // Normalize arcanaBuilds to flattened items and computed totals (same as /slug)
    if (Array.isArray(heroObj.arcanaBuilds)) {
      const fields = ['attack', 'defense', 'magic', 'health', 'mana', 'speed', 'criticalRate', 'criticalDamage', 'penetration', 'magicPenetration', 'lifeSteal', 'magicLifeSteal', 'cooldownReduction', 'attackSpeed', 'movementSpeed'];
      heroObj.arcanaBuilds = heroObj.arcanaBuilds.map(build => {
        let totals = { ...(build.totals || {}) };
        fields.forEach(f => { if (typeof totals[f] !== 'number') totals[f] = 0; });
        const needRecompute = Object.values(totals).every(v => v === 0);
        if (needRecompute) {
          (build.items || []).forEach(it => {
            if (it.arcana && it.arcana.attributes) {
              fields.forEach(f => {
                totals[f] += (it.arcana.attributes[f] || 0) * (it.count || 0);
              });
            }
          });
        }
        return {
          name: build.name,
          description: build.description || '',
          items: (build.items || []).filter(it => it.arcana).map(it => ({
            _id: it.arcana._id,
            name: it.arcana.name,
            image: it.arcana.image,
            color: it.arcana.color,
            tier: it.arcana.tier,
            count: it.count || 1
          })),
          totals
        };
      });
    }
    res.json(heroObj);
  } catch (err) {
    next(err);
  }
};

exports.createHero = async (req, res, next) => {
  try {
    console.log('[HERO][CREATE] Incoming body keys:', Object.keys(req.body));
    if (Array.isArray(req.body.arcanaBuilds)) {
      console.log('[HERO][CREATE] arcanaBuilds count:', req.body.arcanaBuilds.length);
      req.body.arcanaBuilds.forEach((b, i) => {
        console.log(`  Build[${i}] name=${b.name} items=${b.items ? b.items.length : 0}`);
      });
    } else {
      console.log('[HERO][CREATE] arcanaBuilds missing or not array');
    }
    const hero = new Hero(req.body);
    const newHero = await hero.save();
    res.status(201).json(newHero);
  } catch (err) {
    next(err);
  }
};

exports.updateHero = async (req, res, next) => {
  try {
    // Extract the MongoDB ID part before any colon if present
    const idPart = req.params.id.split(':')[0];

    // Check if the ID format is valid
    if (!mongoose.Types.ObjectId.isValid(idPart)) {
      return res.status(400).json({ message: 'ID tướng không hợp lệ' });
    }

    const hero = await Hero.findById(idPart);
    if (!hero) return res.status(404).json({ message: 'Không tìm thấy tướng' });

    // Log for debugging
    console.log('Updating hero:', idPart);
    console.log('Request body:', req.body);
    console.log('Existing hero before assign:', { name: hero.name, slug: hero.slug, id: hero._id });

    Object.assign(hero, req.body);
    console.log('[HERO][UPDATE] After assign arcanaBuilds type:', Array.isArray(hero.arcanaBuilds) ? 'array' : typeof hero.arcanaBuilds, 'length:', Array.isArray(hero.arcanaBuilds) ? hero.arcanaBuilds.length : 0);
    console.log('Hero after assign (pre-save):', { name: hero.name, slug: hero.slug, id: hero._id });

    try {
      const updatedHero = await hero.save();
      console.log('Updated hero successfully');
      return res.json(updatedHero);
    } catch (err) {
      if (err.name === 'ValidationError') {
        console.error('Hero validation error messages:', Object.values(err.errors).map(e => e.message));
        console.error('Hero validation error raw:', Object.keys(err.errors).reduce((acc, k) => { acc[k] = { message: err.errors[k].message, value: err.errors[k].value }; return acc; }, {}));
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          details: Object.values(err.errors).map(e => e.message),
          fields: Object.keys(err.errors)
        });
      }
      if (err && err.code === 11000) { // duplicate key
        console.error('Duplicate key error updating hero:', err.keyValue);
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
        return res.status(400).json({
          success: false,
          message: field === 'slug' || field === 'name' ? 'Tên tướng đã tồn tại' : 'Giá trị đã tồn tại',
          duplicate: true,
          field,
          keyValue: err.keyValue
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error updating hero:', err);
    next(err);
  }
};

exports.deleteHero = async (req, res, next) => {
  try {
    // Extract the MongoDB ID part before any colon if present
    const idPart = req.params.id.split(':')[0];

    // Check if the ID format is valid
    if (!mongoose.Types.ObjectId.isValid(idPart)) {
      return res.status(400).json({ message: 'ID tướng không hợp lệ' });
    }

    const hero = await Hero.findById(idPart);
    if (!hero) return res.status(404).json({ message: 'Không tìm thấy tướng' });

    // Note: hero.remove() is deprecated in newer Mongoose versions
    // Use deleteOne instead
    await Hero.deleteOne({ _id: idPart });
    res.json({ message: 'Đã xóa tướng' });
  } catch (err) {
    console.error('Error deleting hero:', err);
    next(err);
  }
};

exports.getHeroBySlug = async (req, res, next) => {
  try {
    const requested = req.params.slug; // already sanitized by validation middleware
    const populateAll = (q) => q
      .populate({
        path: 'allies.hero',
        select: 'name slug image roles',
      })
      .populate({
        path: 'counters.hero',
        select: 'name slug image roles',
      })
      .populate({
        path: 'goodAgainst.hero',
        select: 'name slug image roles',
      })
      .populate({
        path: 'suggestedArcana.arcana',
        select: 'name image color tier',
      })
      .populate({
        path: 'suggestedEquipment.equipment',
        select: 'name image category tier price',
      })
      .populate({
        path: 'arcanaBuilds.items.arcana',
        select: 'name image color tier attributes'
      });

    // Primary lookup using sanitized slug
    let hero = await populateAll(Hero.findOne({ slug: requested }));

    // Fallbacks for legacy slugs that used special characters like '&'
    if (!hero) {
      const variants = [];
      if (requested.includes('-and-')) variants.push(requested.replace(/-and-/g, '-&-'));
      // Add more legacy patterns here if needed
      for (const v of variants) {
        // eslint-disable-next-line no-await-in-loop
        hero = await populateAll(Hero.findOne({ slug: v }));
        if (hero) break;
      }
    }

    if (!hero) return res.status(404).json({ message: 'Không tìm thấy tướng' });

    // Map lại allies và counters cho FE dễ dùng
    const allies = (hero.allies || []).map(a => a.hero ? ({
      _id: a.hero._id,
      name: a.hero.name,
      slug: a.hero.slug,
      image: a.hero.image,
      roles: a.hero.roles,
    }) : null).filter(Boolean);
    const counters = (hero.counters || []).map(c => c.hero ? ({
      _id: c.hero._id,
      name: c.hero.name,
      slug: c.hero.slug,
      image: c.hero.image,
      roles: c.hero.roles,
    }) : null).filter(Boolean);
    const goodAgainst = (hero.goodAgainst || []).map(g => g.hero ? ({
      _id: g.hero._id,
      name: g.hero.name,
      slug: g.hero.slug,
      image: g.hero.image,
      roles: g.hero.roles,
    }) : null).filter(Boolean);

    const heroObj = hero.toObject();
    heroObj.allies = allies;
    heroObj.counters = counters;
    heroObj.goodAgainst = goodAgainst;
    // Normalize suggested builds sorting by order
    if (Array.isArray(heroObj.suggestedArcana)) {
      heroObj.suggestedArcana = heroObj.suggestedArcana
        .filter(i => i && i.arcana)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(i => ({
          _id: i.arcana._id,
          name: i.arcana.name,
          image: i.arcana.image,
          color: i.arcana.color,
          tier: i.arcana.tier,
          note: i.note || '',
          order: i.order || 0
        }));
    }
    if (Array.isArray(heroObj.suggestedEquipment)) {
      heroObj.suggestedEquipment = heroObj.suggestedEquipment
        .filter(i => i && i.equipment)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(i => ({
          _id: i.equipment._id,
          name: i.equipment.name,
          image: i.equipment.image,
          category: i.equipment.category,
          tier: i.equipment.tier,
          price: i.equipment.price,
          note: i.note || '',
          order: i.order || 0,
          build: typeof i.build === 'number' ? i.build : 1
        }));
    }
    if (Array.isArray(heroObj.arcanaBuilds)) {
      const fields = ['attack', 'defense', 'magic', 'health', 'mana', 'speed', 'criticalRate', 'criticalDamage', 'penetration', 'magicPenetration', 'lifeSteal', 'magicLifeSteal', 'cooldownReduction', 'attackSpeed', 'movementSpeed'];
      heroObj.arcanaBuilds = heroObj.arcanaBuilds.map(build => {
        // Compute totals from populated arcana attributes if not provided
        let totals = { ...(build.totals || {}) };
        fields.forEach(f => { if (typeof totals[f] !== 'number') totals[f] = 0; });
        const shouldRecompute = Object.values(totals).every(v => v === 0);
        if (shouldRecompute) {
          (build.items || []).forEach(it => {
            if (it.arcana && it.arcana.attributes) {
              fields.forEach(f => {
                totals[f] += (it.arcana.attributes[f] || 0) * (it.count || 0);
              });
            }
          });
        }
        // Flatten items for FE (avoid requiring global arcana list)
        const items = (build.items || []).filter(it => it.arcana).map(it => ({
          _id: it.arcana._id,
          name: it.arcana.name,
          image: it.arcana.image,
          color: it.arcana.color,
          tier: it.arcana.tier,
          count: it.count || 1
        }));
        return {
          name: build.name,
          description: build.description || '',
          items,
          totals
        };
      });
    }

    res.json(heroObj);
  } catch (err) {
    next(err);
  }
};