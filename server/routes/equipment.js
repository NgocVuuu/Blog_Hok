const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', equipmentController.getEquipment);
router.get('/:id', equipmentController.getEquipmentById);

// Protected routes (admin only)
router.post('/', auth, equipmentController.createEquipment);
router.put('/:id', auth, equipmentController.updateEquipment);
router.delete('/:id', auth, equipmentController.deleteEquipment);

module.exports = router;
