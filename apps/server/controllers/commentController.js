const Comment = require('../models/Comment');

// Get Comments for a Page
exports.getComments = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;

        // Fetch top-level comments and populate user
        // We fetch everything for now and organize on client or simplified tree here
        // For simplicity: flat list sorted by date, client builds tree? 
        // Or fetch roots then replies? Let's just fetch all for the page.
        const comments = await Comment.find({
            targetType,
            targetId,
            isDeleted: false // or show deleted placeholder?
        })
            .populate('user', 'name avatar role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: comments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Create Comment
exports.createComment = async (req, res) => {
    try {
        const { content, targetType, targetId, parentId } = req.body;

        if (!content || !targetType || !targetId) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const comment = await Comment.create({
            user: req.user.id,
            content,
            targetType,
            targetId,
            parentId: parentId || null
        });

        // Populate user to return immediate UI update
        await comment.populate('user', 'name avatar role');

        res.status(201).json({ success: true, data: comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check ownership or admin
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Soft delete
        comment.isDeleted = true;
        await comment.save();

        res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
