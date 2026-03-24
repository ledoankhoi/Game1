const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Mã định danh (vd: 'firstBlood')
    title: { type: String, required: true },            // Tên thành tựu
    description: { type: String, required: true },      // Mô tả cách đạt được
    targetType: { type: String, enum: ['level', 'gamesPlayed', 'coins', 'streak'], required: true }, // Loại điều kiện
    requirement: { type: Number, required: true },      // Con số cần đạt
    icon: { type: String, default: 'stars' },           // Tên icon Material UI
    color: { type: String, default: 'yellow' }          // Màu sắc hiển thị
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);