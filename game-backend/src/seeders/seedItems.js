require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');

// Kết nối Database (Sửa link nếu máy bạn dùng link khác)
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mathquest', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Đã kết nối Database thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối DB:', err));

// DỮ LIỆU HÀNG HÓA MỚI (Chuẩn form Giai đoạn 1)
const sampleItems = [
    {
        itemId: 'hair_spiky',
        name: 'Tóc Gai Nhọn',
        description: 'Tóc vuốt keo siêu ngầu',
        price: 100,
        category: 'hair',
        imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hair_spiky', // Ảnh đại diện ngoài Shop
        assetUrl: '/assets/avatar/hair_spiky.png' // Ảnh xé nền để lát đắp lên nhân vật
    },
    {
        itemId: 'shirt_red',
        name: 'Áo Phông Đỏ',
        description: 'Áo đỏ chứng tỏ pro',
        price: 150,
        category: 'shirt',
        imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=shirt_red',
        assetUrl: '/assets/avatar/shirt_red.png'
    },
    {
        itemId: 'face_cool',
        name: 'Kính Râm Matrix',
        description: 'Chống tia cực tím, tăng độ ngầu',
        price: 250,
        category: 'face',
        imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=face_cool',
        assetUrl: '/assets/avatar/face_cool.png'
    },
    {
        itemId: 'wings_angel',
        name: 'Cánh Thiên Thần',
        description: 'Vật phẩm siêu hiếm (VIP)',
        price: 1000,
        category: 'wings',
        imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=wings_angel',
        assetUrl: '/assets/avatar/wings_angel.png'
    }
];

const seedItems = async () => {
    try {
        await Item.deleteMany({});
        console.log('🗑️ Đã dọn dẹp kệ hàng cũ.');

        await Item.insertMany(sampleItems);
        console.log('📦 Đã nhập hàng mới thành công!');

        process.exit();
    } catch (error) {
        console.error('❌ Lỗi khi nhập hàng:', error);
        process.exit(1);
    }
};

seedItems();