const Equipment = require('../models/Equipment');

// Get all equipment
exports.getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single equipment
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create equipment
exports.createEquipment = async (req, res) => {
  try {
    console.log('Received equipment data:', JSON.stringify(req.body, null, 2));
    const equipment = new Equipment(req.body);
    const newEquipment = await equipment.save();
    res.status(201).json(newEquipment);
  } catch (err) {
    console.error('Equipment creation error:', err.message);
    console.error('Validation errors:', err.errors);
    res.status(400).json({ message: err.message, errors: err.errors });
  }
};

// Update equipment
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    Object.assign(equipment, req.body);
    const updatedEquipment = await equipment.save();
    res.json(updatedEquipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
