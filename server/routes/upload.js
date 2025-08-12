const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { enhancedAuth, uploadLimiter, adminOpsGuard } = require('../middleware/security');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enhanced file filter for security (include SVG)
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, WebP, AVIF, and SVG images are allowed.'), false);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }

  cb(null, true);
};

// Use dynamic params to handle SVG (no transformations on vectors)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isSvg = file.mimetype === 'image/svg+xml' || (path.extname(file.originalname).toLowerCase() === '.svg');
    const base = {
      folder: isSvg ? 'BlogHok/svg' : 'BlogHok',
      resource_type: 'image',
      allowed_formats: isSvg ? ['svg'] : ['jpg', 'png', 'jpeg', 'avif', 'webp']
    };
    if (isSvg) return base; // No transformations for SVG
    return {
      ...base,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };
  }
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
  adminOpsGuard,
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


// Video upload configuration
const videoFileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only MP4, WebM and OGG videos are allowed.'), false);
  }
  const allowedExtensions = ['.mp4', '.webm', '.ogg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }
  cb(null, true);
};

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'BlogHok/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'ogg']
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  }
});

// Secure video upload route (admin only)
router.post(
  '/video',
  adminOpsGuard,
  uploadLimiter,
  enhancedAuth,
  uploadVideo.single('video'),
  handleUploadError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      res.json({
        success: true,
        message: 'Video uploaded successfully',
        videoUrl: req.file.path,
        data: {
          public_id: req.file.public_id,
          secure_url: req.file.secure_url,
          bytes: req.file.bytes,
          format: req.file.format,
          duration: req.file.duration
        }
      });
    } catch (error) {
      console.error('Upload video error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during video upload' });
    }
  }
);

module.exports = router;