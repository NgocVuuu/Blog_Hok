const mongoose = require('mongoose');

const runeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  effects: [{
    type: String,
  }],
  usage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rune', runeSchema); 