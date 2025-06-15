const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  roles: [{
    type: String,
    required: true,
  }],
  lanes: [{
    type: String,
    required: true,
  }],
  metaTier: {
    type: String,
    required: true,
    enum: ['S+', 'S', 'A', 'B', 'C'],
  },
  winRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  pickRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  banRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    get: v => Number(v.toFixed(2)) // Làm tròn đến 2 chữ số thập phân
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  allies: [
    {
      hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
      },
      description: String,
    }
  ],
  counters: [
    {
      hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
      },
      description: String,
    }
  ],
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lore: {
    type: String,
    default: '',
  },
  profile: {
    type: String,
    default: '',
  },
  combo: [
    {
      skills: [{ type: Number }], // index của skill trong mảng skills
      description: { type: String, default: '' },
    }
  ],
  skins: [
    {
      name: { type: String, required: true },
      image: { type: String, required: true },
    }
  ],
});

// Validate skills array
heroSchema.pre('validate', function(next) {
  // Kiểm tra skills có phải là array không
  if (!Array.isArray(this.skills)) {
    this.invalidate('skills', 'Skills must be an array');
    return next();
  }

  // Lọc bỏ những skill không có description
  this.skills = this.skills.filter(skill => skill && skill.description && skill.description.trim());

  // Kiểm tra số lượng skills
  if (this.skills.length === 0) {
    this.invalidate('skills', 'Hero must have at least one skill with description');
    return next();
  }

  if (this.skills.length > 5) {
    this.invalidate('skills', 'Hero cannot have more than 5 skills');
    return next();
  }

  // Kiểm tra từng skill
  for (let i = 0; i < this.skills.length; i++) {
    const skill = this.skills[i];
    if (!skill.name || !skill.name.trim()) {
      this.invalidate(`skills.${i}.name`, 'Skill name is required');
    }
    if (!skill.description || !skill.description.trim()) {
      this.invalidate(`skills.${i}.description`, 'Skill description is required');
    }
  }

  next();
});

// Update the updatedAt timestamp and slug before saving
heroSchema.pre('save', function(next) {
  console.log('Pre-save hook triggered for hero:', this._id);
  console.log('Hero name:', this.name);
  
  this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  this.updatedAt = Date.now();
  
  console.log('Updated slug:', this.slug);
  console.log('Updated timestamp:', this.updatedAt);
  
  next();
});

// Enable getters
heroSchema.set('toJSON', { getters: true });
heroSchema.set('toObject', { getters: true });

// Create indexes for better query performance
heroSchema.index({ name: 'text', title: 'text' }); // Text search
heroSchema.index({ roles: 1, metaTier: 1 }); // Filter by role and tier
heroSchema.index({ metaTier: 1, winRate: -1 }); // Sort by tier and win rate
heroSchema.index({ slug: 1 }, { unique: true }); // Unique slug lookup
heroSchema.index({ lanes: 1 }); // Filter by lanes
heroSchema.index({ createdAt: -1 }); // Sort by creation date

module.exports = mongoose.model('Hero', heroSchema);