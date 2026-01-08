const mongoose = require('mongoose');

const draftChangeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['NEW_HERO', 'NEW_SKIN'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    targetHeroName: {
        type: String,
        required: true
    },
    targetHeroId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hero'
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    discoveredAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    }
});

module.exports = mongoose.model('DraftChange', draftChangeSchema);
