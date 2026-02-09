/* File: src/models/Item.js */
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, default: 'skin' }
});

module.exports = mongoose.model('Item', ItemSchema);