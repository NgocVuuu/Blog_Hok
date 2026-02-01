const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const { enhancedAuth } = require('../middleware/security');
const { syncHoKMeta } = require('../services/syncHoKMetaService');

// Lấy meta hiện tại
router.get('/', metaController.getAllMeta);

// Special trending heroes (public)
router.get('/special-trending', metaController.getSpecialTrending);

// Public site info by key (e.g. heroes_meta_updated)
router.get('/site-info/:key', metaController.getSiteInfoByKey);

// Thêm meta (admin)
router.post('/', enhancedAuth, metaController.createMeta);

// Sửa meta (admin)
router.patch('/:id', enhancedAuth, metaController.updateMeta);

// Xóa meta (admin)
router.delete('/:id', enhancedAuth, metaController.deleteMeta);

// Trigger HoK meta sync (admin)
router.post('/sync/hok', enhancedAuth, async (req, res, next) => {
	try {
		const dryRun = Boolean(req.query.dry === '1' || req.body?.dry === true);
		const result = await syncHoKMeta({ dryRun });
		res.json({ success: true, dryRun, ...result });
	} catch (err) {
		next(err);
	}
});

module.exports = router; 