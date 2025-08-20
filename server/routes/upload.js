const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { logger } = require('../utils/logger');
const { enhancedAuth, uploadLimiter, adminOpsGuard } = require('../middleware/security');
const localUpload = require('../middleware/upload');

// Cloudinary configuration (optional)
let cloudinaryEnabled = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinaryEnabled = true;
} else {
  logger.warn('Cloudinary not configured. Use /api/upload/local for local-disk uploads.');
}

// Enhanced file filter for security (include SVG)
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
  if (!allowedMimes.includes(file.mimetype)) {
  logger.warn('Upload rejected due to MIME type', { mimetype: file.mimetype, fieldname: file.fieldname, originalname: file.originalname });
  return cb(new Error('Invalid file type. Only JPEG, PNG, WebP, AVIF, and SVG images are allowed.'), false);
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    logger.warn('Upload rejected due to extension', { ext, originalname: file.originalname });
    return cb(new Error('Invalid file extension.'), false);
  }

  cb(null, true);
};

// Use dynamic params to handle SVG (no transformations on vectors)
const storage = cloudinaryEnabled ? new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const extLower = path.extname(file.originalname).toLowerCase();
    const isSvg = file.mimetype === 'image/svg+xml' || extLower === '.svg';
    const isAvif = file.mimetype === 'image/avif' || extLower === '.avif';
    const base = {
      folder: isSvg ? 'BlogHok/svg' : 'BlogHok',
      resource_type: 'image',
      allowed_formats: isSvg ? ['svg'] : ['jpg', 'png', 'jpeg', 'avif', 'webp']
    };
    if (isSvg || isAvif) return base; // No transformations for SVG/AVIF
    return {
      ...base,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };
  }
}) : null;

const upload = cloudinaryEnabled ? multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
}) : null;

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
    // Detect Cloudinary/provider-side errors and map to 503 to allow client fallback
    const msg = error && (error.message || '');
    const isCloudinaryError =
      /cloudinary/i.test(msg) ||
      /Invalid image file/i.test(msg) ||
      (typeof error.http_code === 'number' && error.http_code >= 400);

    logger.error('Upload middleware error', {
      error: {
        message: error.message,
        stack: error.stack,
        http_code: error.http_code,
        name: error.name
      }
    });

    if (isCloudinaryError) {
      return res.status(503).json({
        success: false,
        code: 'CLOUDINARY_ERROR',
        error: `Cloudinary error: ${msg || 'Upload failed'}`
      });
    }

    return res.status(400).json({
      success: false,
      error: msg || 'Upload failed'
    });
  }
  next();
};

// Secure upload route (admin only)
router.post('/',
  adminOpsGuard,
  uploadLimiter,
  enhancedAuth,
  (req, res, next) => {
    if (!cloudinaryEnabled) {
      return res.status(503).json({ success: false, error: 'Cloudinary unavailable. Use /api/upload/local.' });
    }
    next();
  },
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

      logger.info('Image uploaded to cloud', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        cloudinary: {
          public_id: req.file.public_id,
          format: req.file.format,
          bytes: req.file.bytes,
          width: req.file.width,
          height: req.file.height
        }
      });

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
      logger.error('Upload handler error', { error: { message: error.message, stack: error.stack } });
      res.status(500).json({
        success: false,
        message: 'Internal server error during upload'
      });
    }
  }
);

// Local-disk fallback upload (no Cloudinary). Returns /uploads/* URL.
// Use when CLOUDINARY is down or disabled; guarded like the main route.
router.post(
  '/local',
  adminOpsGuard,
  uploadLimiter,
  enhancedAuth,
  ...localUpload.uploadSingle('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      // uploadSingle sets req.file.secureUrl
      logger.info('Image stored locally', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename,
        path: req.file.path,
      });
      return res.json({
        success: true,
        message: 'File uploaded successfully (local)',
        imageUrl: req.file.secureUrl,
      });
    } catch (error) {
      logger.error('Local upload handler error', { error: { message: error.message, stack: error.stack } });
      return res.status(500).json({ success: false, message: 'Internal server error during local upload' });
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

const videoStorage = cloudinaryEnabled ? new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'BlogHok/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'ogg']
  }
}) : null;

const uploadVideo = cloudinaryEnabled ? multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  }
}) : null;

// Secure video upload route (admin only)
router.post(
  '/video',
  adminOpsGuard,
  uploadLimiter,
  enhancedAuth,
  (req, res, next) => {
    if (!cloudinaryEnabled) {
      return res.status(503).json({ success: false, error: 'Cloudinary unavailable. Video upload disabled.' });
    }
    next();
  },
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