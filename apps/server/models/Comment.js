const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    targetType: {
        type: String,
        enum: ['Hero', 'News'],
        required: true
    },
    targetId: {
        type: String, // Slug or ID
        required: true,
        index: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// We often query comments by targetId (page) + parentId (root vs reply)
commentSchema.index({ targetId: 1, parentId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
