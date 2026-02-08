const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- ĐIỂM SỐ ---
    highScores: {
        monster:  { type: Number, default: 0 },
        sequence: { type: Number, default: 0 },
        speed:    { type: Number, default: 0 }
    },

    // --- TIỀN TỆ & CỬA HÀNG ---
    coins: { type: Number, default: 100 }, 
    inventory: { type: [String], default: ['default'] },
    equippedSkin: { type: String, default: 'default' }
});

// --- 1. MÃ HÓA MẬT KHẨU ---
// (Chỉ mã hóa khi tạo mới hoặc đổi pass, tránh mã hóa lại mật khẩu cũ)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- 2. SO SÁNH MẬT KHẨU ---
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);