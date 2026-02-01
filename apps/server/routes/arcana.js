const express = require('express');
const router = express.Router();
const arcanaController = require('../controllers/arcanaController');
const { enhancedAuth } = require('../middleware/security');
const { adminOpsGuard } = require('../middleware/security');

// Lấy tất cả arcana
router.get('/', arcanaController.getAllArcana);

// Lấy 1 arcana
router.get('/:id', arcanaController.getArcanaById);

// Thêm arcana (admin)
router.post('/', adminOpsGuard, enhancedAuth, arcanaController.createArcana);

// Sửa arcana (admin)
router.patch('/:id', adminOpsGuard, enhancedAuth, arcanaController.updateArcana);

// Xóa arcana (admin)
router.delete('/:id', adminOpsGuard, enhancedAuth, arcanaController.deleteArcana);

module.exports = router;
