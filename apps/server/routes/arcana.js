const express = require('express');
const router = express.Router();
const arcanaController = require('../controllers/arcanaController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOpsGuard } = require('../middleware/security');

// Lấy tất cả arcana
router.get('/', arcanaController.getAllArcana);

// Lấy 1 arcana
router.get('/:id', arcanaController.getArcanaById);

// Thêm arcana (admin)
router.post('/', adminOpsGuard, authMiddleware, arcanaController.createArcana);

// Sửa arcana (admin)
router.patch('/:id', adminOpsGuard, authMiddleware, arcanaController.updateArcana);

// Xóa arcana (admin)
router.delete('/:id', adminOpsGuard, authMiddleware, arcanaController.deleteArcana);

module.exports = router;
