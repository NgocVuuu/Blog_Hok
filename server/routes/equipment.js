const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth');
const { adminOpsGuard } = require('../middleware/security');

// Public routes
router.get('/', equipmentController.getEquipment);
router.get('/:id', equipmentController.getEquipmentById);

// Protected routes (admin only)
router.post('/', adminOpsGuard, auth, equipmentController.createEquipment);
router.put('/:id', adminOpsGuard, auth, equipmentController.updateEquipment);
router.delete('/:id', adminOpsGuard, auth, equipmentController.deleteEquipment);

module.exports = router;
