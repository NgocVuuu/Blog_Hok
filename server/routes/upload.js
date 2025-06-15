const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { enhancedAuth, uploadLimiter } = require('../middleware/security');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enhanced file filter for security
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF images are allowed.'), false);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }

  cb(null, true);
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'BlogHok',
    allowed_formats: ['jpg', 'png', 'jpeg', 'avif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
      { quality: 'auto:good' }, // Auto optimize quality
      { fetch_format: 'auto' } // Auto format selection
    ]
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 5MB.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          error: `Upload error: ${error.message}`
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  next();
};

// Secure upload route (admin only)
router.post('/',
  uploadLimiter,
  enhancedAuth,
  upload.single('image'),
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        imageUrl: req.file.path,
        data: {
          public_id: req.file.public_id,
          secure_url: req.file.secure_url,
          width: req.file.width,
          height: req.file.height,
          format: req.file.format,
          bytes: req.file.bytes
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during upload'
      });
    }
  }
);

module.exports = router;