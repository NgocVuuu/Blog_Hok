const Equipment = require('../models/Equipment');

// Get all equipment
exports.getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    // Normalize quickStats so clients always get a non-empty array when possible
    const normalized = equipment.map((doc) => {
      const obj = doc.toObject();
      if (!Array.isArray(obj.quickStats) || obj.quickStats.length === 0) {
        const source = obj.attributes || obj.stats;
        if (source && typeof source === 'object') {
          obj.quickStats = Object.entries(source)
            .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
            .slice(0, 5)
            .map(([k, v]) => ({ type: k, value: typeof v === 'number' ? `+${v}` : String(v), description: '' }));
        } else {
          obj.quickStats = [];
        }
      }
      return obj;
    });
    res.json(normalized);
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
    const obj = equipment.toObject();
    if (!Array.isArray(obj.quickStats) || obj.quickStats.length === 0) {
      const source = obj.attributes || obj.stats;
      if (source && typeof source === 'object') {
        obj.quickStats = Object.entries(source)
          .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
          .slice(0, 5)
          .map(([k, v]) => ({ type: k, value: typeof v === 'number' ? `+${v}` : String(v), description: '' }));
      } else {
        obj.quickStats = [];
      }
    }
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create equipment
exports.createEquipment = async (req, res) => {
  try {
    console.log('Received equipment data:', JSON.stringify(req.body, null, 2));
    const payload = { ...req.body };
    // Normalize quickStats entries to include 'type'
    if (Array.isArray(payload.quickStats)) {
      payload.quickStats = payload.quickStats.map(q => ({
        type: q.type || q.label || '',
        label: q.label || q.type || '',
        value: q.value || '',
        description: q.description || ''
      }));
    }
    const equipment = new Equipment(payload);
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

    const patch = { ...req.body };
    if (Array.isArray(patch.quickStats)) {
      patch.quickStats = patch.quickStats.map(q => ({
        type: q.type || q.label || '',
        label: q.label || q.type || '',
        value: q.value || '',
        description: q.description || ''
      }));
    }
    Object.assign(equipment, patch);
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
