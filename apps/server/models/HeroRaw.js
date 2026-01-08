const mongoose = require('mongoose');

const heroRawSchema = new mongoose.Schema({
    hero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero',
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    // Store raw strategy data from Official API
    strategyData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Store raw presets (equip/arcana) from Official/Wiki
    rawPresets: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Store any other raw dumps
    officialData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    wikiData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

heroRawSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('HeroRaw', heroRawSchema);
