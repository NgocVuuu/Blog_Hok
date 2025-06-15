const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File type validation
const allowedImageTypes = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Generate secure filename
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomBytes}${ext}`;
};

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    // Check MIME type
    if (!allowedImageTypes[file.mimetype]) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
    
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedImageExtensions.includes(ext)) {
      return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp files are allowed.'), false);
    }
    
    // Additional security: Check if extension matches MIME type
    const expectedExt = allowedImageTypes[file.mimetype];
    if (ext !== expectedExt && !(ext === '.jpeg' && expectedExt === '.jpg')) {
      return cb(new Error('File extension does not match file type.'), false);
    }
    
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    } catch (error) {
      cb(error);
    }
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // Only one file at a time
    fields: 10, // Limit number of fields
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 * 1024 // 1MB for field values
  },
  fileFilter: fileFilter
});

// File validation middleware (additional server-side validation)
const validateUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  try {
    const filePath = req.file.path;
    const stats = fs.statSync(filePath);
    
    // Check file size again
    if (stats.size > 5 * 1024 * 1024) {
      fs.unlinkSync(filePath); // Delete the file
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 5MB limit'
      });
    }
    
    // Check if file is actually an image by reading file header
    const fileBuffer = fs.readFileSync(filePath, { start: 0, end: 10 });
    const fileSignature = fileBuffer.toString('hex').toUpperCase();
    
    const imageSignatures = {
      'FFD8FF': 'jpg',
      '89504E47': 'png',
      '47494638': 'gif',
      '52494646': 'webp'
    };
    
    let isValidImage = false;
    for (const [signature, type] of Object.entries(imageSignatures)) {
      if (fileSignature.startsWith(signature)) {
        isValidImage = true;
        break;
      }
    }
    
    if (!isValidImage) {
      fs.unlinkSync(filePath); // Delete the file
      return res.status(400).json({
        success: false,
        error: 'File is not a valid image'
      });
    }
    
    // Add file info to request
    req.file.secureUrl = `/uploads/${req.file.filename}`;
    
    next();
  } catch (error) {
    // Clean up file if validation fails
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting invalid file:', unlinkError);
      }
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error validating uploaded file'
    });
  }
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 5MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files. Only one file is allowed.'
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

// Clean up old files (utility function)
const cleanupOldFiles = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading upload directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            } else {
              console.log('Deleted old file:', file);
            }
          });
        }
      });
    });
  });
};

// Run cleanup daily
setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000);

// Single file upload middleware
const uploadSingle = (fieldName) => [
  upload.single(fieldName),
  handleUploadError,
  validateUploadedFile
];

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  handleUploadError,
  validateUploadedFile
];

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateUploadedFile,
  handleUploadError,
  cleanupOldFiles
};
