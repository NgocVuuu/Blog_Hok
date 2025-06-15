const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');
const { enhancedAuth, searchLimiter } = require('../middleware/security');
const {
  validateHero,
  validateSearch,
  validateId,
  validateSlug
} = require('../middleware/validation');

// Public routes with validation
router.get('/', searchLimiter, validateSearch, heroController.getAllHeroes);
router.get('/slug/:slug', validateSlug, heroController.getHeroBySlug);
router.get('/:id', validateId, heroController.getHeroById);

// Protected routes (admin only)
router.post('/', enhancedAuth, validateHero, heroController.createHero);
router.put('/:id', enhancedAuth, validateId, validateHero, heroController.updateHero);
router.patch('/:id', enhancedAuth, validateId, validateHero, heroController.updateHero);
router.delete('/:id', enhancedAuth, validateId, heroController.deleteHero);

module.exports = router; 