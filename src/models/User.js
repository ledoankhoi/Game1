const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Thư viện vừa cài ở bước 1

const userSchema = new mongoose.Schema({
    // 1. Thông tin tài khoản
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // 2. Thông tin điểm số (Lưu riêng từng game)
    highScores: {
        monster:  { type: Number, default: 0 }, // Điểm game Diệt Quái
        sequence: { type: Number, default: 0 }  // Điểm game Chuỗi Số
    },

    // 3. Ngày tạo
    createdAt: { type: Date, default: Date.now }
});

// --- Hàm mã hóa mật khẩu (Giữ nguyên logic chuẩn) ---
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);