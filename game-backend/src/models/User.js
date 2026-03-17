const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // --- BẢO MẬT & ĐĂNG NHẬP ---
    googleId: { type: String, unique: true, sparse: true }, 
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String }, 
    avatarUrl: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, 

    // --- TÀI SẢN & KINH NGHIỆM ---
    coins: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalScore: { type: Number, default: 0 }, // [ĐÃ SỬA] Đưa ra ngoài, ngang hàng với exp

    // --- THỐNG KÊ GAME ---
    favoriteGames: { type: [String], default: [] }, 
    highScores: { type: Map, of: Number, default: {} }, 

    // --- HỆ THỐNG TÚI ĐỒ & NHÂN VẬT (AVATAR) ---
    inventory: { type: [String], default: ['skin_default', 'face_smile'] }, 
    equipped: {
        skin: { type: String, default: 'skin_default' }, 
        face: { type: String, default: 'face_smile' },   
        hair: { type: String, default: '' },             
        shirt: { type: String, default: '' },            
        pants: { type: String, default: '' },            
        shoes: { type: String, default: '' },            
        accessory: { type: String, default: '' },        
        wings: { type: String, default: '' }
        // [ĐÃ SỬA] Xóa bỏ exp và totalScore bị lọt vào đây
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);