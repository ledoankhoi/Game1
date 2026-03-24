const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Mã định danh (vd: 'play3Games')
    title: { type: String, required: true },            // Tên nhiệm vụ hiển thị
    type: { type: String, enum: ['daily', 'weekly', 'milestone'], default: 'daily' }, // Loại nhiệm vụ
    requirement: { type: Number, required: true },      // Yêu cầu cần đạt (vd: 3 ván)
    rewardCoins: { type: Number, default: 0 },          // Thưởng Vàng
    rewardExp: { type: Number, default: 0 },            // Thưởng Kinh nghiệm
    icon: { type: String, default: 'task' },            // Tên icon Material UI
    color: { type: String, default: 'blue' }            // Màu sắc hiển thị
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);