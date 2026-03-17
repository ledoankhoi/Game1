const User = require('../models/User');
const Item = require('../models/Item');
const Game = require('../models/Game');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. QUẢN LÝ NGƯỜI DÙNG (USERS)
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Đã xóa tài khoản thành công!" });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, role, coins } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: "Email đã tồn tại!" });

        await User.create({
            username, email, password, // Mongoose pre('save') sẽ tự hash
            role: role || 'user',
            coins: coins || 100
        });
        res.json({ success: true, message: "Tạo tài khoản thành công!" });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

const updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // BƯỚC QUAN TRỌNG: Gỡ _id ra khỏi gói hàng để MongoDB không cấm cản
        delete updateData._id; 

        // Xử lý mật khẩu an toàn
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password; // Không đổi pass thì giữ nguyên
        } else {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await User.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true, message: "Cập nhật tài khoản thành công!" });
    } catch (error) {
        console.error("Lỗi Update User:", error);
        res.status(500).json({ success: false, message: "Lỗi Server Cập nhật" });
    }
};

// ==========================================
// 2. QUẢN LÝ CỬA HÀNG (ITEMS)
// ==========================================
const createItem = async (req, res) => {
    try {
        const newItem = await Item.create(req.body);
        res.json({ success: true, message: "Tạo vật phẩm thành công!", item: newItem });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi tạo vật phẩm" }); }
};

const deleteItem = async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Đã xóa vật phẩm khỏi cửa hàng!" });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

const updateItem = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id; // Tránh lỗi MongoDB
        await Item.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true, message: "Cập nhật vật phẩm thành công!" });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

// ==========================================
// 3. QUẢN LÝ GAME (GAMES)
// ==========================================
const createGame = async (req, res) => {
    try {
        const newGame = await Game.create(req.body);
        res.json({ success: true, message: "Tạo Game thành công!", game: newGame });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi tạo Game" }); }
};

const deleteGame = async (req, res) => {
    try {
        await Game.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Đã xóa Game thành công!" });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

const updateGame = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id; // Tránh lỗi MongoDB
        await Game.findByIdAndUpdate(req.params.id, updateData);
        res.json({ success: true, message: "Cập nhật Game thành công!" });
    } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
};

// Gói ghém tất cả gửi cho Routes
module.exports = {
    getAllUsers, deleteUser, createUser, updateUser,
    createItem, deleteItem, updateItem,
    createGame, deleteGame, updateGame
};