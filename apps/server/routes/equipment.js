const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { enhancedAuth } = require('../middleware/security');
const { adminOpsGuard } = require('../middleware/security');

// Public routes
router.get('/', equipmentController.getEquipment);
router.get('/:id', equipmentController.getEquipmentById);

// Protected routes (admin only)
router.post('/', adminOpsGuard, enhancedAuth, equipmentController.createEquipment);
router.put('/:id', adminOpsGuard, enhancedAuth, equipmentController.updateEquipment);
router.delete('/:id', adminOpsGuard, enhancedAuth, equipmentController.deleteEquipment);

module.exports = router;
