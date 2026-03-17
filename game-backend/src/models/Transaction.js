const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, // Số dương: Nhận tiền | Số âm: Tiêu tiền
    reason: { type: String, required: true }, // VD: 'buy_item', 'game_reward'
    itemId: { type: String, default: null }   // Nếu mua đồ thì lưu mã đồ vào đây (VD: 'hair_spiky')
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);