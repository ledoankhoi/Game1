const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // --- BẢO MẬT & ĐĂNG NHẬP ---
    googleId: { type: String, unique: true, sparse: true }, // ID từ Google
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String }, // Không bắt buộc nữa vì đăng nhập Google không cần pass
    avatarUrl: { type: String }, // Ảnh gốc từ Google

    // --- TÀI SẢN & KINH NGHIỆM ---
    coins: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    
    // --- THỐNG KÊ GAME ---
    favoriteGames: { type: [String], default: [] }, // Danh sách mã game yêu thích
    highScores: { type: Map, of: Number, default: {} }, // Lưu kỷ lục: { "monster": 500, "speed": 120 }

    // --- HỆ THỐNG TÚI ĐỒ & NHÂN VẬT (AVATAR) ---
    inventory: { type: [String], default: ['skin_default', 'face_smile'] }, // Chứa ID các item đã mua
    equipped: {
        skin: { type: String, default: 'skin_default' }, // Làn da
        face: { type: String, default: 'face_smile' },   // Biểu cảm
        hair: { type: String, default: '' },             // Tóc/Mũ
        shirt: { type: String, default: '' },            // Áo
        pants: { type: String, default: '' },            // Quần
        shoes: { type: String, default: '' },            // Giày
        accessory: { type: String, default: '' },        // Phụ kiện (Nhẫn, Dây chuyền)
        wings: { type: String, default: '' },            // Cánh
        exp: { type: Number, default: 0 }, 
        totalScore: { type: Number, default: 0 }             
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);