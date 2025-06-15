const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
  patch: {
    type: String,
    required: true
  },
  heroes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hero'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

metaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Meta', metaSchema); 