const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy meta hiện tại
router.get('/', metaController.getAllMeta);

// Thêm meta (admin)
router.post('/', authMiddleware, metaController.createMeta);

// Sửa meta (admin)
router.patch('/:id', authMiddleware, metaController.updateMeta);

// Xóa meta (admin)
router.delete('/:id', authMiddleware, metaController.deleteMeta);

module.exports = router; 