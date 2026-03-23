const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetType: { type: String, enum: ['coins', 'streak', 'gamesPlayed', 'level'], required: true }, // Dựa vào đâu để xét duyệt
    requirement: { type: Number, required: true }, // Mốc cần đạt
    icon: { type: String, default: 'military_tech' },
    color: { type: String, default: 'yellow' }
});

module.exports = mongoose.model('Achievement', achievementSchema);