const mongoose = require('mongoose');

const siteInfoSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

siteInfoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SiteInfo', siteInfoSchema);
