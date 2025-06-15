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
        .select('name title image roles lanes metaTier winRate pickRate banRate slug')
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
    
    const hero = await Hero.findById(idPart);
    if (!hero) return res.status(404).json({ message: 'Không tìm thấy tướng' });
    res.json(hero);
  } catch (err) {
    next(err);
  }
};

exports.createHero = async (req, res, next) => {
  try {
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
    
    Object.assign(hero, req.body);
    const updatedHero = await hero.save();
    
    console.log('Updated hero successfully');
    res.json(updatedHero);
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
    const hero = await Hero.findOne({ slug: req.params.slug })
      .populate({
        path: 'allies.hero',
        select: 'name slug image roles',
      })
      .populate({
        path: 'counters.hero',
        select: 'name slug image roles',
      });
    if (!hero) return res.status(404).json({ message: 'Không tìm thấy tướng' });

    // Map lại allies và counters cho FE dễ dùng
    const allies = (hero.allies || []).map(a => a.hero ? ({
      _id: a.hero._id,
      name: a.hero.name,
      slug: a.hero.slug,
      image: a.hero.image,
      roles: a.hero.roles,
      description: a.description || ''
    }) : null).filter(Boolean);
    const counters = (hero.counters || []).map(c => c.hero ? ({
      _id: c.hero._id,
      name: c.hero.name,
      slug: c.hero.slug,
      image: c.hero.image,
      roles: c.hero.roles,
      description: c.description || ''
    }) : null).filter(Boolean);

    const heroObj = hero.toObject();
    heroObj.allies = allies;
    heroObj.counters = counters;

    res.json(heroObj);
  } catch (err) {
    next(err);
  }
}; 