const { body, param, query, validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');

// Middleware để xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Sanitize MongoDB injection
const sanitizeInput = (req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
};

// Validation rules for different entities
const validateHero = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Hero name must be between 1 and 100 characters')
    .escape(),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Hero title must be between 1 and 200 characters')
    .escape(),
  body('roles')
    .isArray({ min: 1 })
    .withMessage('Hero must have at least one role'),
  body('roles.*')
    .isIn(['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'])
    .withMessage('Invalid role'),
  body('lanes')
    .isArray({ min: 1 })
    .withMessage('Hero must have at least one lane'),
  body('lanes.*')
    .isIn(['Top', 'Jungle', 'Mid', 'Bot', 'Support'])
    .withMessage('Invalid lane'),
  body('metaTier')
    .isIn(['S+', 'S', 'A', 'B', 'C'])
    .withMessage('Invalid meta tier'),
  body('winRate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Win rate must be between 0 and 100'),
  body('pickRate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Pick rate must be between 0 and 100'),
  body('banRate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Ban rate must be between 0 and 100'),
  body('skills')
    .isArray({ min: 1, max: 5 })
    .withMessage('Hero must have 1-5 skills'),
  body('skills.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill name must be between 1 and 100 characters')
    .escape(),
  body('skills.*.description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Skill description must be between 1 and 1000 characters')
    .escape(),
  handleValidationErrors
];

const validateNews = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('News title must be between 1 and 200 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('News content must be between 1 and 10000 characters'),
  body('category')
    .optional()
    .isIn(['guides', 'updates', 'events', 'esports'])
    .withMessage('Invalid category'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name must be less than 100 characters')
    .escape(),
  handleValidationErrors
];

const validateEquipment = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name must be between 1 and 100 characters')
    .escape(),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Equipment description must be between 1 and 1000 characters'),
  body('price')
    .isInt({ min: 0 })
    .withMessage('Price must be a positive integer'),
  body('category')
    .isIn(['Physical', 'Magic', 'Defense', 'Movement', 'Jungling'])
    .withMessage('Invalid equipment category'),
  handleValidationErrors
];

const validateArcana = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Arcana name must be between 1 and 100 characters')
    .escape(),
  body('color')
    .isIn(['red', 'blue', 'green'])
    .withMessage('Invalid arcana color'),
  body('tier')
    .isInt({ min: 1, max: 3 })
    .withMessage('Arcana tier must be 1, 2, or 3'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Arcana description must be between 1 and 500 characters')
    .escape(),
  handleValidationErrors
];

const validateAuth = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters')
    .escape(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sort')
    .optional()
    .isIn(['latest', 'oldest', 'title', 'name'])
    .withMessage('Invalid sort option'),
  handleValidationErrors
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

const validateSlug = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Invalid slug format')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

module.exports = {
  sanitizeInput,
  validateHero,
  validateNews,
  validateEquipment,
  validateArcana,
  validateAuth,
  validateSearch,
  validateId,
  validateSlug,
  handleValidationErrors
};
