const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authLimiter, enhancedAuth, blacklistToken } = require('../middleware/security');
const { validateAuth } = require('../middleware/validation');

// Enhanced login with rate limiting and validation
router.post('/login', authLimiter, validateAuth, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get admin profile (protected route)
router.get('/profile', enhancedAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Enhanced logout with token blacklisting
router.post('/logout', enhancedAuth, (req, res) => {
  try {
    // Blacklist the current token
    blacklistToken(req.token);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Enhanced registration with validation
router.post('/register', authLimiter, validateAuth, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password with higher salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin user
    const user = new User({
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully!'
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 