const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questCode: { type: String, required: true }, // VD: 'play_3_games'
    progress: { type: Number, default: 0 },      // Tiến độ (VD: 1/3)
    target: { type: Number, required: true },    // Mục tiêu (VD: 3)
    isCompleted: { type: Boolean, default: false },
    rewardClaimed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quest', QuestSchema);