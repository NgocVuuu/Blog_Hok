const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { sendContact } = require('../controllers/contactController');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many messages sent, please try later.' }
});

router.post('/', contactLimiter, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('subject')
    .optional()
    .isLength({ max: 150 })
    .withMessage('Subject must be at most 150 characters'),
  body('message')
    .isLength({ min: 5, max: 5000 })
    .withMessage('Message must be between 5 and 5000 characters')
], sendContact);

// Ping route để kiểm tra nhanh việc mount
router.get('/ping', (req, res) => {
  res.json({ success: true, route: 'contact', timestamp: new Date().toISOString() });
});

// Debug route (non-sensitive) to help diagnose 400 issues
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    rules: {
      name: '1-100 chars',
      email: 'valid email',
      subject: 'optional, max 150',
      message: '5-5000 chars'
    },
    env: {
      contactToConfigured: Boolean(process.env.CONTACT_TO),
      smtpUserConfigured: Boolean(process.env.SMTP_USER),
      mailFromConfigured: Boolean(process.env.MAIL_FROM)
    },
    note: 'No secret values exposed'
  });
});

module.exports = router;
