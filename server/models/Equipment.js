const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Attack', 'Defense', 'Magic', 'Movement', 'Jungle'],
    required: true,
  },
  tier: {
    type: String,
    enum: ['Basic', 'Advanced', 'Epic', 'Legendary'],
    default: 'Basic',
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  attributes: {
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
    movementSpeed: { type: Number, default: 0 },
    armor: { type: Number, default: 0 },
    magicResist: { type: Number, default: 0 }
  },
  passive: {
    name: String,
    description: String,
  },
  active: {
    name: String,
    description: String,
    cooldown: Number,
  },
  buildPath: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  buildsInto: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  recommendedFor: [{
    type: String, // Vai trò tướng phù hợp
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Equipment', equipmentSchema);
