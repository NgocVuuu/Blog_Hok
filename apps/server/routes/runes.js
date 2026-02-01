const express = require('express');
const router = express.Router();
const runeController = require('../controllers/runeController');
const { enhancedAuth } = require('../middleware/security');
const { adminOpsGuard } = require('../middleware/security');

// Lấy tất cả rune
router.get('/', runeController.getAllRunes);

// Lấy 1 rune
router.get('/:id', runeController.getRuneById);

// Thêm rune (admin)
router.post('/', adminOpsGuard, enhancedAuth, runeController.createRune);

// Sửa rune (admin)
router.patch('/:id', adminOpsGuard, enhancedAuth, runeController.updateRune);

// Xóa rune (admin)
router.delete('/:id', adminOpsGuard, enhancedAuth, runeController.deleteRune);

module.exports = router; 