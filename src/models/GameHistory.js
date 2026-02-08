const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Liên kết với bảng User
        ref: 'User',
        required: true
    },
    gameName: {
        type: String,
        required: true // Ví dụ: 'monster' hoặc 'sequence'
    },
    score: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // Thời gian chơi (giây)
        default: 0
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameHistory', GameHistorySchema);