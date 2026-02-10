/* src/models/User.js */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // Tiền và Điểm
    coins: { type: Number, default: 100 },
    highScores: {
        monster:  { type: Number, default: 0 },
        sequence: { type: Number, default: 0 },
        speed:    { type: Number, default: 0 }
    },
    
    // Kho đồ
    inventory: { type: [String], default: ['default'] },
    equippedSkin: { type: String, default: 'default' }
}, { timestamps: true });

// --- 1. TỰ ĐỘNG MÃ HÓA MẬT KHẨU KHI LƯU ---
UserSchema.pre('save', async function(next) {
    // Nếu mật khẩu không bị sửa đổi thì bỏ qua (để tránh mã hóa lại mật khẩu đã mã hóa)
    if (!this.isModified('password')) {
        return next();
    }
    
    // Tạo muối và băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- 2. HÀM KIỂM TRA MẬT KHẨU (Dùng khi đăng nhập) ---
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);