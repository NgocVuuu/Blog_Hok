const mongoose = require('mongoose');

const arcanaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    required: true,
    enum: ['red', 'blue', 'green'], // Màu của arcana
  },
  tier: {
    type: Number,
    required: true,
    min: 1,
    max: 3, // Tier 1, 2, 3
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
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
    movementSpeed: { type: Number, default: 0 }
  },
  effects: [{
    type: String,
  }],
  usage: {
    type: String,
  },
  recommendedFor: [{
    type: String, // Vai trò tướng phù hợp
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Arcana', arcanaSchema);
