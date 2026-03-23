const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Mã nhiệm vụ (vd: 'dailyLogin')
    title: { type: String, required: true }, // Tên hiển thị
    type: { type: String, enum: ['daily', 'weekly', 'monthly', 'milestone'], required: true }, // Loại
    requirement: { type: Number, required: true }, // Yêu cầu (vd: 3 ván)
    rewardCoins: { type: Number, default: 0 }, // Thưởng Xu
    rewardExp: { type: Number, default: 0 }, // Thưởng Kinh nghiệm
    icon: { type: String, default: 'assignment' }, // Icon Google Material
    color: { type: String, default: 'blue' } // Màu sắc
});

module.exports = mongoose.model('Quest', questSchema);