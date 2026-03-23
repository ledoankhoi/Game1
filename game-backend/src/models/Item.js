const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemId: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },                 
    description: { type: String },
    price: { type: Number, required: true },                
    category: { 
        type: String, 
        // THÊM 'frame' VÀO DANH SÁCH DƯỚI ĐÂY:
        enum: ['skin', 'face', 'hair', 'shirt', 'pants', 'shoes', 'accessory', 'wings', 'frame'], 
        required: true 
    },

    rarity: {
        type: String,
        enum: ['silver', 'green', 'blue', 'purple', 'gold', 'rainbow'], 
        default: 'silver' 
    },

    imageUrl: { type: String, required: true }, 
    assetUrl: { type: String, }  
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);