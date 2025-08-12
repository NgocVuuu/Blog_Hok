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
  required: false,
  },
  pickRate: {
  type: Number,
  required: false,
  },
  banRate: {
  type: Number,
  required: false,
    get: v => Number(v.toFixed(2)) // Làm tròn đến 2 chữ số thập phân
  },
  skills: [{
    name: {
      type: String,
      required: false,
      trim: true
    },
    icon: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: false,
      trim: true
    }
  }],
  allies: [
    {
      hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
      },
    }
  ],
  counters: [
    {
      hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
      },
    }
  ],
  goodAgainst: [
    {
      hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
      },
    }
  ],
  slug: {
  type: String,
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
  // Suggested Arcana build (ordered)
  suggestedArcana: [
    {
      arcana: { type: mongoose.Schema.Types.ObjectId, ref: 'Arcana' },
      note: { type: String, default: '' },
      order: { type: Number, default: 0 }
    }
  ],
  // Suggested Equipment build (ordered)
  suggestedEquipment: [
    {
      equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
      note: { type: String, default: '' },
  order: { type: Number, default: 0 },
  build: { type: Number, default: 1 } // 1..3
    }
  ],
  // Full arcana page builds with counts & precomputed totals
  arcanaBuilds: [
    {
      name: { type: String, required: true },
      description: { type: String, default: '' },
      items: [
        {
          arcana: { type: mongoose.Schema.Types.ObjectId, ref: 'Arcana', required: true },
          count: { type: Number, required: true, min: 1, max: 10 }
        }
      ],
      totals: {
        attack: { type: Number, default: 0 },
        defense: { type: Number, default: 0 },
        magic: { type: Number, default: 0 },
        health: { type: Number, default: 0 },
        mana: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        criticalRate: { type: Number, default: 0 },
        criticalDamage: { type: Number, default: 0 },
        penetration: { type: Number, default: 0 },
        magicPenetration: { type: Number, default: 0 },
        lifeSteal: { type: Number, default: 0 },
        magicLifeSteal: { type: Number, default: 0 },
        cooldownReduction: { type: Number, default: 0 },
        attackSpeed: { type: Number, default: 0 },
        movementSpeed: { type: Number, default: 0 }
      }
    }
  ],
});

// Relaxed skill validation: just keep skills with either name or description; require at least one
heroSchema.pre('validate', function(next) {
  if (!Array.isArray(this.skills)) {
    this.skills = [];
  }
  this.skills = this.skills.filter(skill => skill && (
    (skill.name && skill.name.trim()) || (skill.description && skill.description.trim())
  ));
  if (this.skills.length === 0) {
    this.invalidate('skills', 'At least one skill (name or description) is required');
  }
  // Auto-trim
  this.skills = this.skills.map(s => ({
    name: s.name ? s.name.trim() : '',
    icon: s.icon || '',
    description: s.description ? s.description.trim() : ''
  })).slice(0,5); // still cap at 5 silently

  // Ensure slug exists before required validation kicks in (since slug field is unique)
  if (this.name) {
    const generated = this.name.toLowerCase().trim().replace(/\s+/g, '-');
    if (!this.slug || this.isModified('name')) {
      this.slug = generated;
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

  // Recompute arcanaBuilds totals if items present
  if (Array.isArray(this.arcanaBuilds)) {
    const fields = ['attack','defense','magic','health','mana','speed','criticalRate','criticalDamage','penetration','magicPenetration','lifeSteal','magicLifeSteal','cooldownReduction','attackSpeed','movementSpeed'];
    this.arcanaBuilds.forEach(build => {
      if (!Array.isArray(build.items)) return;
      // Only recompute if totals missing or zeroed
      let need = !build.totals || fields.every(f => (build.totals[f]||0) === 0);
      if (!build.totals) build.totals = {};
      if (need) {
        fields.forEach(f => { build.totals[f] = 0; });
        // We can't populate here, so expect client not to send attributes; skip unless arcana subdoc has attributes
        build.items.forEach(it => {
          if (it.arcana && it.arcana.attributes) {
            fields.forEach(f => {
              const per = it.arcana.attributes[f] || 0;
              build.totals[f] += per * (it.count || 0);
            });
          }
        });
      }
    });
  }
  
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
heroSchema.index({ 'suggestedArcana.arcana': 1 });
heroSchema.index({ 'suggestedEquipment.equipment': 1 });

module.exports = mongoose.model('Hero', heroSchema);