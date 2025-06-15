const express = require('express');
const router = express.Router();
const arcanaController = require('../controllers/arcanaController');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy tất cả arcana
router.get('/', arcanaController.getAllArcana);

// Lấy 1 arcana
router.get('/:id', arcanaController.getArcanaById);

// Thêm arcana (admin)
router.post('/', authMiddleware, arcanaController.createArcana);

// Sửa arcana (admin)
router.patch('/:id', authMiddleware, arcanaController.updateArcana);

// Xóa arcana (admin)
router.delete('/:id', authMiddleware, arcanaController.deleteArcana);

module.exports = router;
