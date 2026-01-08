const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { blacklistToken } = require('../middleware/security');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Start Google Login
exports.loginWithGoogle = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // If user exists but no googleId (legacy or email match), update it
            if (!user.googleId) {
                user.googleId = googleId;
                user.authType = 'google'; // Or keep 'local' but allow google link? Let's switch to google for simplicity if verified
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                email,
                name,
                avatar: picture,
                googleId,
                authType: 'google',
                role: 'user' // Default to user
            });
        }

        const token = generateToken(user);

        // Set HttpOnly Cookie
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // HTTPS in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24h
        });

        res.json({
            success: true,
            // No need to send token in body if using cookies, but maybe for redundancy or mobile app
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(401).json({ success: false, message: 'Invalid Google Token' });
    }
};
// End Google Login

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Return token
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Current User Profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            blacklistToken(token);
        }

        // Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
