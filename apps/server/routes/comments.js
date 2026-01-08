const express = require('express');
const router = express.Router();
const { getComments, createComment, deleteComment, toggleLike } = require('../controllers/commentController');
const { protect } = require('../middleware/checkRole');

// Public read
router.get('/:targetType/:targetId', getComments);

// Protected actions
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
