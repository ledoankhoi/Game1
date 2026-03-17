const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemId: { type: String, required: true, unique: true }, // Ví dụ: 'hat_cap_01'
    name: { type: String, required: true },                 // Mũ Lưỡi Trai
    description: { type: String },
    price: { type: Number, required: true },                // Giá xu
    category: { 
        type: String, 
        enum: ['skin', 'face', 'hair', 'shirt', 'pants', 'shoes', 'accessory', 'wings'], 
        required: true 
    },

    rarity: {
        type: String,
        enum: ['silver', 'green', 'blue', 'purple', 'gold', 'rainbow'], // Giới hạn các bậc
        default: 'silver' // Mặc định nếu thêm item mà quên set độ hiếm thì là hạng Thường
    },

    imageUrl: { type: String, required: true }, // Ảnh hiển thị trong Shop
    assetUrl: { type: String, }  // Ảnh xé nền (PNG trong suốt) để đắp lên nhân vật
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);