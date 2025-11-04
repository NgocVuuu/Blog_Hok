const express = require('express');
const router = express.Router();
const runeController = require('../controllers/runeController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOpsGuard } = require('../middleware/security');

// Lấy tất cả rune
router.get('/', runeController.getAllRunes);

// Lấy 1 rune
router.get('/:id', runeController.getRuneById);

// Thêm rune (admin)
router.post('/', adminOpsGuard, authMiddleware, runeController.createRune);

// Sửa rune (admin)
router.patch('/:id', adminOpsGuard, authMiddleware, runeController.updateRune);

// Xóa rune (admin)
router.delete('/:id', adminOpsGuard, authMiddleware, runeController.deleteRune);

module.exports = router; 