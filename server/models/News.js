const mongoose = require('mongoose');

// Function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    enum: ['guides', 'updates', 'events', 'esports'],
    default: 'guides',
  },
  author: {
    type: String,
    default: 'BlogHok',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to generate slug
newsSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    let baseSlug = generateSlug(this.title);
    this.slug = baseSlug;
  }
  next();
});

// Create indexes for better query performance
newsSchema.index({ title: 'text', content: 'text' }); // Text search
newsSchema.index({ publishedAt: -1 }); // Sort by publish date
newsSchema.index({ category: 1, publishedAt: -1 }); // Filter by category and sort
newsSchema.index({ slug: 1 }, { unique: true }); // Unique slug lookup
newsSchema.index({ author: 1 }); // Filter by author

module.exports = mongoose.model('News', newsSchema);