const News = require('../models/News');

exports.getAllNews = async (req, res, next) => {
  try {
    const {
      sort = 'latest',
      limit = 20,
      page = 1,
      category,
      search,
      author
    } = req.query;

    // Build query
    let query = {};

    // Add category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add author filter if provided
    if (author) {
      query.author = author;
    }

    // Add search filter if provided (use text index for better performance)
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'latest':
        sortCriteria = { publishedAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { publishedAt: 1 };
        break;
      case 'title':
        sortCriteria = { title: 1 };
        break;
      case 'relevance':
        if (search) {
          sortCriteria = { score: { $meta: 'textScore' } };
        } else {
          sortCriteria = { publishedAt: -1 };
        }
        break;
      default:
        sortCriteria = { publishedAt: -1 };
    }

    // Calculate pagination
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 items per page
    const skip = (parseInt(page) - 1) * limitNum;

    // Build projection for list view (exclude large content field)
    const projection = limit && parseInt(limit) <= 10
      ? 'title slug image category author publishedAt createdAt'
      : 'title slug image category author publishedAt createdAt content';

    // Execute queries in parallel
    const [news, total] = await Promise.all([
      News.find(query)
        .select(projection)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .maxTimeMS(10000),
      News.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: news,
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
    console.error('Error in getAllNews:', err);
    next(err);
  }
};

exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
    res.json(news);
  } catch (err) {
    next(err);
  }
};

exports.getNewsBySlug = async (req, res, next) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });
    if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
    res.json(news);
  } catch (err) {
    next(err);
  }
};

exports.createNews = async (req, res, next) => {
  try {
    const news = new News(req.body);
    const newNews = await news.save();
    res.status(201).json(newNews);
  } catch (err) {
    next(err);
  }
};

exports.updateNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
    Object.assign(news, req.body);
    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (err) {
    next(err);
  }
};

exports.deleteNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'Không tìm thấy tin tức' });
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa tin tức' });
  } catch (err) {
    next(err);
  }
};