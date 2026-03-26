const mongoose = require('mongoose');

// Định nghĩa cấu trúc cho bảng Hướng dẫn
const gameInstructionSchema = new mongoose.Schema({
    gameSlug: { type: String, required: true, unique: true }, // Dùng mã slug để biết hướng dẫn này của game nào (VD: 'monster')
    howToPlay: [{
        step: { type: Number },           // Bước 1, Bước 2...
        description: { type: String },    // Nội dung hướng dẫn
        imageUrl: { type: String }        // Ảnh minh họa trực quan
    }]
}, { timestamps: true });

// Xuất Model ra với tên Collection trong MongoDB sẽ là 'gameinstructions'
module.exports = mongoose.model('GameInstruction', gameInstructionSchema);