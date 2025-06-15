const Arcana = require('../models/Arcana');

// Lấy tất cả arcana
exports.getAllArcana = async (req, res) => {
    try {
        const { color, tier, sort } = req.query;
        let query = {};
        
        // Filter by color
        if (color && color !== 'all') {
            query.color = color;
        }
        
        // Filter by tier
        if (tier && tier !== 'all') {
            query.tier = parseInt(tier);
        }
        
        let arcanaQuery = Arcana.find(query);
        
        // Sort
        if (sort === 'name') {
            arcanaQuery = arcanaQuery.sort({ name: 1 });
        } else if (sort === 'tier') {
            arcanaQuery = arcanaQuery.sort({ tier: 1, name: 1 });
        } else {
            arcanaQuery = arcanaQuery.sort({ color: 1, tier: 1, name: 1 });
        }
        
        const arcana = await arcanaQuery;
        res.json(arcana);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy 1 arcana theo ID
exports.getArcanaById = async (req, res) => {
    try {
        const arcana = await Arcana.findById(req.params.id);
        if (!arcana) {
            return res.status(404).json({ message: 'Không tìm thấy arcana' });
        }
        res.json(arcana);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo arcana mới
exports.createArcana = async (req, res) => {
    try {
        const newArcana = new Arcana(req.body);
        const savedArcana = await newArcana.save();
        res.status(201).json(savedArcana);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật arcana
exports.updateArcana = async (req, res) => {
    try {
        const updatedArcana = await Arcana.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedArcana) {
            return res.status(404).json({ message: 'Không tìm thấy arcana' });
        }
        res.json(updatedArcana);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa arcana
exports.deleteArcana = async (req, res) => {
    try {
        const deletedArcana = await Arcana.findByIdAndDelete(req.params.id);
        if (!deletedArcana) {
            return res.status(404).json({ message: 'Không tìm thấy arcana' });
        }
        res.json({ message: 'Đã xóa arcana thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
