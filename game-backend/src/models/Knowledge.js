const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Game', 'Economy', 'Feature', 'Story', 'System'] // Phân loại kiến thức
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Knowledge', knowledgeSchema);