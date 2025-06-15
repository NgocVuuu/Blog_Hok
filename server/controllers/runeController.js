const Rune = require('../models/Rune');

// Lấy tất cả rune
exports.getAllRunes = async (req, res) => {
    try {
        const runes = await Rune.find();
        res.json(runes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy 1 rune theo ID
exports.getRuneById = async (req, res) => {
    try {
        const rune = await Rune.findById(req.params.id);
        if (!rune) {
            return res.status(404).json({ message: 'Không tìm thấy rune' });
        }
        res.json(rune);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo rune mới
exports.createRune = async (req, res) => {
    try {
        const newRune = new Rune(req.body);
        const savedRune = await newRune.save();
        res.status(201).json(savedRune);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật rune
exports.updateRune = async (req, res) => {
    try {
        const updatedRune = await Rune.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRune) {
            return res.status(404).json({ message: 'Không tìm thấy rune' });
        }
        res.json(updatedRune);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa rune
exports.deleteRune = async (req, res) => {
    try {
        const deletedRune = await Rune.findByIdAndDelete(req.params.id);
        if (!deletedRune) {
            return res.status(404).json({ message: 'Không tìm thấy rune' });
        }
        res.json({ message: 'Đã xóa rune thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 