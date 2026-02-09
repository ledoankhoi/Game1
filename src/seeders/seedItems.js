/* src/seeders/seedItems.js */
require('dotenv').config({ path: './.env' }); // Đảm bảo có file .env ở thư mục gốc
const mongoose = require('mongoose');
const Item = require('../models/Item');

const items = [
    { itemId: 'default', name: 'Default Space', price: 0, type: 'skin' },
    { itemId: 'forest', name: 'Forest Realm', price: 500, type: 'skin' },
    { itemId: 'ice', name: 'Ice Kingdom', price: 1000, type: 'skin' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 DB Connected.');
        await Item.deleteMany({});
        await Item.insertMany(items);
        console.log('✅ Đã thêm vật phẩm vào Shop thành công!');
        process.exit();
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedDB();