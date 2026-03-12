const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    gameId: { type: String, required: true }, // Ví dụ: 'monster', 'chess'
    score: { type: Number, required: true },
    expEarned: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 }
}, { timestamps: true });

// Tạo chỉ mục (Index) để truy xuất Bảng xếp hạng cho một game cực nhanh
GameHistorySchema.index({ gameId: 1, score: -1 });

module.exports = mongoose.model('GameHistory', GameHistorySchema);