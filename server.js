/* file: server.js - Phiên bản nâng cấp Shop & Skin */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// --- 1. KẾT NỐI MONGODB ---
const MONGO_URI = 'mongodb://127.0.0.1:27017/MathQuestDB'; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công với MongoDB!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Phục vụ file game

// --- 2. ĐỊNH NGHĨA MODEL (SCHEMA) ---

// Model User: Thêm trường currentOutfit
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: String,
    coins: { type: Number, default: 0 },
    inventory: { type: [String], default: ['default'] },
    currentOutfit: { type: String, default: 'default' } // <-- MỚI: Lưu trang phục đang mặc
});
const User = mongoose.model('User', UserSchema, 'users');

// Model Item: Giữ nguyên
const ItemSchema = new mongoose.Schema({
    itemId: { type: String, unique: true },
    name: String,
    price: Number,
    type: String,
    description: String
});
const Item = mongoose.model('Item', ItemSchema, 'items');


// --- 3. CÁC API XỬ LÝ ---

// API: Lấy thông tin User (Trả về cả currentOutfit)
app.post('/api/user/info', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (user) {
            res.json({ 
                success: true, 
                coins: user.coins, 
                inventory: user.inventory,
                currentOutfit: user.currentOutfit || 'default' // Trả về trang phục đang mặc
            });
        } else {
            res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Lấy danh sách Shop
app.get('/api/shop/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API: Mua vật phẩm
app.post('/api/shop/buy', async (req, res) => {
    const { username, itemId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User lỗi' });

        const item = await Item.findOne({ itemId });
        if (!item) return res.status(404).json({ success: false, message: 'Item lỗi' });

        // Kiểm tra đã có chưa
        if (user.inventory.includes(itemId)) {
            return res.json({ success: false, message: 'Đã sở hữu vật phẩm này!' });
        }

        // Kiểm tra tiền
        if (user.coins < item.price) {
            return res.json({ success: false, message: 'Không đủ tiền!' });
        }

        // Trừ tiền & Thêm đồ
        user.coins -= item.price;
        user.inventory.push(itemId);
        await user.save();

        console.log(`User ${username} bought ${itemId}`);
        
        res.json({ 
            success: true, 
            newCoins: user.coins, 
            inventory: user.inventory,
            message: 'Mua thành công!' 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// API MỚI: Trang bị (Mặc đồ)
app.post('/api/user/equip', async (req, res) => {
    const { username, itemId } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User lỗi' });

        // Kiểm tra xem có trong kho đồ không
        if (!user.inventory.includes(itemId)) {
            return res.status(400).json({ success: false, message: 'Bạn chưa mua món đồ này!' });
        }

        // Cập nhật trang phục hiện tại
        user.currentOutfit = itemId;
        await user.save();

        console.log(`User ${username} equipped ${itemId}`);
        
        res.json({ 
            success: true, 
            currentOutfit: user.currentOutfit,
            message: 'Đã thay đổi trang phục!' 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});