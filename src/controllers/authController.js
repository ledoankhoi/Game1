const User = require('../models/User');

// --- 1. ĐĂNG KÝ ---
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Kiểm tra dữ liệu
        if (!username || !email || !password) return res.status(400).json({ success: false, message: "Thiếu thông tin!" });
        
        // Kiểm tra trùng lặp
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: "Email đã tồn tại!" });

        // Tạo user mới
        const newUser = await User.create({ username, email, password });
        res.status(201).json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 2. ĐĂNG NHẬP ---
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                // Trả về điểm số của cả 2 game để Frontend hiển thị
                scores: user.highScores 
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 3. CẬP NHẬT ĐIỂM SỐ (Logic mới) ---
const updateScore = async (req, res) => {
    try {
        // Nhận: tên người dùng, số điểm, và LOẠI GAME (monster hoặc sequence)
        const { username, score, gameType } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "Không tìm thấy User" });

        // Kiểm tra loại game có hợp lệ không (chống hack)
        if (user.highScores[gameType] === undefined) {
            return res.status(400).json({ message: "Loại game không hợp lệ" });
        }

        // Logic so sánh điểm cũ và mới
        const currentScore = user.highScores[gameType];
        
        if (score > currentScore) {
            // Cập nhật điểm mới
            user.highScores[gameType] = score;
            
            // Báo cho MongoDB biết là object này đã thay đổi (Bắt buộc)
            user.markModified('highScores');
            
            await user.save();
            return res.json({ message: "Đã lưu kỷ lục mới!", newHighScore: score });
        } else {
            return res.json({ message: "Chưa phá kỷ lục.", currentHighScore: currentScore });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// --- 4. LẤY BẢNG XẾP HẠNG ---
const getLeaderboard = async (req, res) => {
    try {
        const leaders = await User.find().select('username highScores');
        res.json({ success: true, data: leaders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- XUẤT KHẨU (Gọn gàng, không lỗi) ---
module.exports = { register, login, updateScore, getLeaderboard };