const express = require('express');
const router = express.Router();
const runeController = require('../controllers/runeController');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy tất cả rune
router.get('/', runeController.getAllRunes);

// Lấy 1 rune
router.get('/:id', runeController.getRuneById);

// Thêm rune (admin)
router.post('/', authMiddleware, runeController.createRune);

// Sửa rune (admin)
router.patch('/:id', authMiddleware, runeController.updateRune);

// Xóa rune (admin)
router.delete('/:id', authMiddleware, runeController.deleteRune);

module.exports = router; 