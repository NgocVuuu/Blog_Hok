const express = require('express');
const router = express.Router();
const { login, logout, getMe, loginWithGoogle } = require('../controllers/authController');
const { protect } = require('../middleware/checkRole');
const { authLimiter } = require('../middleware/security');
const { validateAuth } = require('../middleware/validation');

router.post('/login', authLimiter, validateAuth, login);
router.post('/google', authLimiter, loginWithGoogle);
router.get('/profile', protect, getMe);
router.get('/me', protect, getMe); // Alias for /profile
router.post('/logout', protect, logout);

module.exports = router; 