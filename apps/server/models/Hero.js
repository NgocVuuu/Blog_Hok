const mongoose = require('mongoose');

// Create a URL-safe slug from a name
function slugify(input) {
  if (!input) return '';
  return String(input)
    .normalize('NFD') // split accented characters
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/&/g, ' and ') // replace ampersand with word
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-'); // collapse multiple hyphens
}

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
  // Optional: multiple skill variants/builds (client may send this in addition to 'skills').
  // Not required by validators; stored as-is for future use.
  skillBuilds: [
    {
      name: { type: String, default: '' },
      skills: [
        {
          name: { type: String, trim: true },
          icon: { type: String, default: '' },
          description: { type: String, trim: true }
        }
      ]
    }
  ],
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
  // Optional: combos per skill build (1..3)
  comboBuilds: [
    {
      name: { type: String, default: '' },
      steps: [
        {
          skills: [{ type: Number }],
          description: { type: String, default: '' }
        }
      ]
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

  // Normalize optional skillBuilds (do not enforce presence)
  if (!Array.isArray(this.skillBuilds)) this.skillBuilds = [];
  this.skillBuilds = this.skillBuilds.slice(0,3).map(b => ({
    name: (b && b.name ? String(b.name) : '').trim(),
    skills: Array.isArray(b && b.skills) ? b.skills.slice(0,5).map(s => ({
      name: s && s.name ? String(s.name).trim() : '',
      icon: s && s.icon ? String(s.icon) : '',
      description: s && s.description ? String(s.description).trim() : ''
    })).filter(x => x.name || x.description) : []
  })).filter(bb => bb.skills.length > 0);

  // Normalize optional comboBuilds
  if (!Array.isArray(this.comboBuilds)) this.comboBuilds = [];
  this.comboBuilds = this.comboBuilds.slice(0,3).map((b,i) => ({
    name: (b && b.name ? String(b.name) : '').trim() || `Bộ ${i+1}`,
    steps: Array.isArray(b && b.steps) ? b.steps.map(st => ({
      skills: Array.isArray(st && st.skills) ? st.skills.map(n => Number(n)).filter(n => Number.isInteger(n) && n >= 0 && n <= 5) : [],
      description: st && st.description ? String(st.description).trim() : ''
    })) : []
  })).filter(bb => Array.isArray(bb.steps) && bb.steps.length > 0);

  // Ensure slug exists before required validation kicks in (since slug field is unique)
  if (this.name) {
  const generated = slugify(this.name);
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
  
  this.slug = slugify(this.name);
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