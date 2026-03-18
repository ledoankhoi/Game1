const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho một trò chơi
const gameSchema = new mongoose.Schema({
    title: { type: String, required: true },        // Tên game (VD: Galaxy Striker)
    slug: { type: String, required: true, unique: true }, // Tên đường dẫn (VD: monster)
    thumbnailUrl: { type: String, required: true }, // Link ảnh đại diện
    gameUrl: { type: String, required: true },      // Đường dẫn file chạy game
    category: { type: [String], required: true },     // Thể loại (Math, Logic...)
    views: { type: Number, default: 0, } ,
    isActive: { 
        type: Boolean, 
        default: true // Mặc định khi tạo game mới là sẽ được Hiển thị
    }            // Lượt chơi (Mặc định là 0)
}, { timestamps: true }); // Tự động lưu thời gian tạo/cập nhật

// Xuất Model ra để các file khác (như gameSeeder) có thể dùng được
module.exports = mongoose.model('Game', gameSchema);