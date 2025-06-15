const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { enhancedAuth, searchLimiter } = require('../middleware/security');
const {
  validateNews,
  validateSearch,
  validateId,
  validateSlug
} = require('../middleware/validation');

// Public routes with validation
router.get('/', searchLimiter, validateSearch, newsController.getAllNews);
router.get('/slug/:slug', validateSlug, newsController.getNewsBySlug);
router.get('/:id', validateId, newsController.getNewsById);

// Protected routes (admin only)
router.post('/', enhancedAuth, validateNews, newsController.createNews);
router.patch('/:id', enhancedAuth, validateId, validateNews, newsController.updateNews);
router.delete('/:id', enhancedAuth, validateId, newsController.deleteNews);

module.exports = router; 