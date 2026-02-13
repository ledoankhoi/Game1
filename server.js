/* file: server.js - Phiên bản FULL (Auth, Shop, Leaderboard, Level, Avatar, PlayCounts) */
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
app.use(express.static('public'));

// --- 2. ĐỊNH NGHĨA MODEL ---

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String }, 
    password: { type: String, required: true },
    coins: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    avatarId: { type: String, default: 'avatar_1' }, // ID Avatar
    inventory: { type: [String], default: ['default'] },
    currentOutfit: { type: String, default: 'default' },
    
    // Lưu điểm cao
    highScores: {
        monster: { type: Number, default: 0 },
        sequence: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        pixel: { type: Number, default: 0 },
        maze: { type: Number, default: 0 }
    },

    // Lưu số lần chơi (MỚI THÊM)
    playCounts: {
        monster: { type: Number, default: 0 },
        sequence: { type: Number, default: 0 },
        speed: { type: Number, default: 0 },
        pixel: { type: Number, default: 0 },
        maze: { type: Number, default: 0 }
    }
});
const User = mongoose.model('User', UserSchema, 'users');

const ItemSchema = new mongoose.Schema({
    itemId: { type: String, unique: true },
    name: String,
    price: Number,
    type: String,
    description: String
});
const Item = mongoose.model('Item', ItemSchema, 'items');


// --- 3. API AUTH (ĐĂNG KÝ & ĐĂNG NHẬP) ---

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
        
        // Tạo user mới kèm playCounts mặc định
        const newUser = new User({ 
            username, 
            email, 
            password, 
            avatarId: 'avatar_1',
            playCounts: { monster: 0, sequence: 0, speed: 0, pixel: 0 }
        });
        await newUser.save();
        
        console.log(`✨ Đăng ký mới: ${username}`);
        res.json({ success: true, message: 'Đăng ký thành công!' });
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const loginIdentifier = req.body.email || req.body.username; 
    const password = req.body.password;

    try {
        const user = await User.findOne({ 
            $or: [{ email: loginIdentifier }, { username: loginIdentifier }] 
        });

        if (user && user.password === password) {
            console.log(`🔑 Đăng nhập thành công: ${user.username}`);
            res.json({ success: true, username: user.username });
        } else {
            res.json({ success: false, message: 'Sai thông tin đăng nhập!' });
        }
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
});


// --- 4. API USER (THÔNG TIN & AVATAR) ---

app.post('/api/user/info', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            res.json({ 
                success: true, 
                coins: user.coins, 
                exp: user.exp || 0,
                avatarId: user.avatarId || 'avatar_1',
                highScores: user.highScores || {},
                playCounts: user.playCounts || {}, // Trả về số lần chơi
                inventory: user.inventory,
                currentOutfit: user.currentOutfit || 'default'
            });
        } else {
            res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/user/avatar', async (req, res) => {
    const { username, avatarId } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User lỗi' });

        user.avatarId = avatarId;
        await user.save();
        
        console.log(`User ${username} changed avatar to ${avatarId}`);
        res.json({ success: true, avatarId: user.avatarId });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi Server' });
    }
});


// --- 5. API SHOP & ITEM ---

app.get('/api/shop/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/shop/buy', async (req, res) => {
    const { username, itemId } = req.body;
    try {
        const user = await User.findOne({ username });
        const item = await Item.findOne({ itemId });
        
        if (!user || !item) return res.json({ success: false, message: 'Lỗi dữ liệu' });
        if (user.inventory.includes(itemId)) return res.json({ success: false, message: 'Đã sở hữu!' });
        if (user.coins < item.price) return res.json({ success: false, message: 'Không đủ tiền!' });

        user.coins -= item.price;
        user.inventory.push(itemId);
        await user.save();
        res.json({ success: true, newCoins: user.coins, inventory: user.inventory, message: 'Mua thành công!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

app.post('/api/user/equip', async (req, res) => {
    const { username, itemId } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false });
        
        if (user.inventory.includes(itemId)) {
            user.currentOutfit = itemId;
            await user.save();
            res.json({ success: true, currentOutfit: user.currentOutfit });
        } else {
            res.status(400).json({ success: false, message: 'Chưa sở hữu item này' });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});


// --- 6. API GAME & LEADERBOARD ---

// API Cập nhật phần thưởng + Số lần chơi
app.post('/api/user/reward', async (req, res) => {
    const { username, coins, exp, game } = req.body; // Thêm tham số 'game'
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false });

        if (coins) user.coins += coins;
        if (exp) user.exp += exp;

        // Tăng số lần chơi nếu có tên game
        if (game) {
            if (!user.playCounts) user.playCounts = {};
            // Tăng playCounts cho game tương ứng
            user.playCounts[game] = (user.playCounts[game] || 0) + 1;
            // Mongoose cần lệnh này để nhận biết thay đổi trong object nested
            user.markModified('playCounts'); 
        }

        await user.save();
        
        res.json({ success: true, newCoins: user.coins, newExp: user.exp });
    } catch (err) {
        console.error("Lỗi reward:", err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/user/highscore', async (req, res) => {
    const { username, game, score } = req.body; 
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false });

        if (!user.highScores) user.highScores = {};
        const currentScore = user.highScores[game] || 0;
        
        if (score > currentScore) {
            user.highScores[game] = score;
            await user.save();
            res.json({ success: true, message: 'Kỷ lục mới!' });
        } else {
            res.json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/auth/leaderboard', async (req, res) => {
    try {
        const users = await User.find({}, 'username highScores exp currentOutfit avatarId');
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});