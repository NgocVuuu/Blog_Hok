const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const authMiddleware = require('../middleware/authMiddleware');
const { syncHoKMeta } = require('../services/syncHoKMetaService');

// Lấy meta hiện tại
router.get('/', metaController.getAllMeta);

// Special trending heroes (public)
router.get('/special-trending', metaController.getSpecialTrending);

// Thêm meta (admin)
router.post('/', authMiddleware, metaController.createMeta);

// Sửa meta (admin)
router.patch('/:id', authMiddleware, metaController.updateMeta);

// Xóa meta (admin)
router.delete('/:id', authMiddleware, metaController.deleteMeta);

// Trigger HoK meta sync (admin)
router.post('/sync/hok', authMiddleware, async (req, res, next) => {
	try {
		const dryRun = Boolean(req.query.dry === '1' || req.body?.dry === true);
		const result = await syncHoKMeta({ dryRun });
		res.json({ success: true, dryRun, ...result });
	} catch (err) {
		next(err);
	}
});

module.exports = router; 