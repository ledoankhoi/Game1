const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    facebookId: { type: String },
    avatarUrl: { type: String },
    
    coins: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalScore: { type: Number, default: 0 },
    
    inventory: { type: [String], default: ['skin_default', 'face_smile'] },
    equipped: {
        skin: { type: String, default: 'skin_default' },
        face: { type: String, default: 'face_smile' },
        frame: { type: String, default: 'none' }, 
        badge: { type: String, default: 'none' }
    },
    
    highScores: { type: Map, of: Number, default: {} },
    favoriteGames: { type: [String], default: [] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // --- THÊM PHẦN LƯU NHIỆM VỤ & THÀNH TỰU Ở ĐÂY ---
    loginStreak: { type: Number, default: 1 }, // Chuỗi đăng nhập
    lastLoginDate: { type: Date, default: Date.now }, // Ngày online cuối cùng
    quests: {
        dailyLoginClaimed: { type: Boolean, default: false },
        gamesPlayedToday: { type: Number, default: 0 },
        gamesPlayedClaimed: { type: Boolean, default: false },
        scoreHunterClaimed: { type: Boolean, default: false }
    },
    stats: {
        totalGamesPlayed: { type: Number, default: 0 },
        loginStreak: { type: Number, default: 0 }
    },
    questProgress: {
        type: Map,
        of: Number,
        default: {} // Ví dụ: { "play3Games": 1, "scoreHunter": 5000 }
    },
    completedQuests: [{ type: String }], // Lưu ID các nhiệm vụ đã xong hôm nay
    unlockedAchievements: [{ type: String }],

    claimedQuests: {
        type: Map,
        of: Date,
        default: {} // Ví dụ: { "play3Games": "2023-10-25T12:00:00Z" }
    },
}, { timestamps: true });

// Mã hóa password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Kiểm tra password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);