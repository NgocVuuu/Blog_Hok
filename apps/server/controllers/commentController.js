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

// Toggle Like
exports.toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Check if user already liked
        const index = comment.likes.indexOf(req.user.id);

        if (index === -1) {
            // Not liked yet -> Add like
            comment.likes.push(req.user.id);
        } else {
            // Already liked -> Remove like
            comment.likes.splice(index, 1);
        }

        await comment.save();

        res.json({ success: true, data: comment.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get All Comments (Admin)
exports.getAllComments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
             return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const startIndex = (page - 1) * limit;

        const total = await Comment.countDocuments();
        
        const comments = await Comment.find()
            .populate('user', 'name avatar email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.json({
            success: true,
            data: comments,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
