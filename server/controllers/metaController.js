const Meta = require('../models/Meta');

exports.getAllMeta = async (req, res, next) => {
  try {
    const meta = await Meta.find().populate('champions');
    res.json(meta);
  } catch (err) {
    next(err);
  }
};

exports.createMeta = async (req, res, next) => {
  try {
    const meta = new Meta(req.body);
    const newMeta = await meta.save();
    res.status(201).json(newMeta);
  } catch (err) {
    next(err);
  }
};

exports.updateMeta = async (req, res, next) => {
  try {
    const meta = await Meta.findById(req.params.id);
    if (!meta) return res.status(404).json({ message: 'Không tìm thấy meta' });
    Object.assign(meta, req.body);
    const updatedMeta = await meta.save();
    res.json(updatedMeta);
  } catch (err) {
    next(err);
  }
};

exports.deleteMeta = async (req, res, next) => {
  try {
    const meta = await Meta.findById(req.params.id);
    if (!meta) return res.status(404).json({ message: 'Không tìm thấy meta' });
    await meta.remove();
    res.json({ message: 'Đã xóa meta' });
  } catch (err) {
    next(err);
  }
}; 