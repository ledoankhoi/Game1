const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. ĐĂNG KÝ ---
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin!" });
        }

        // Check tồn tại
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email hoặc Tên đã tồn tại!" });
        }

        // Tạo user (User.js sẽ tự mã hóa password)
        await User.create({ 
            username, 
            email, 
            password, 
            coins: 100 // Tặng 100 coin
        });

        res.status(201).json({ success: true, message: "Đăng ký thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 2. ĐĂNG NHẬP ---
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user
        const user = await User.findOne({ email });
        
        // Kiểm tra user & Mật khẩu
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
        }

        // Tạo token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins || 0,
                equippedSkin: user.equippedSkin,
                scores: user.highScores
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 3. CẬP NHẬT ĐIỂM & TIỀN (QUAN TRỌNG NHẤT) ---
const updateScore = async (req, res) => {
    try {
        const { username, score, gameType } = req.body;
        
        // Log để kiểm tra xem Server có nhận được không
        console.log(`📥 SERVER NHẬN: ${username} - ${gameType} - Điểm: ${score}`);

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        // --- A. TÍNH TIỀN (LUÔN CHẠY) ---
        // Quy tắc: 1 điểm = 10 vàng
        const earnedCoins = score * 10;
        
        // Đảm bảo coins là số (tránh lỗi nếu DB cũ chưa có)
        if (!user.coins) user.coins = 0;
        
        user.coins = user.coins + earnedCoins;
        console.log(`💰 Cộng ${earnedCoins} vàng. Tổng tiền mới: ${user.coins}`);

        // --- B. XỬ LÝ KỶ LỤC ---
        const validGames = ['monster', 'sequence', 'speed'];
        let message = `Bạn nhận được +${earnedCoins} vàng!`;

        if (validGames.includes(gameType)) {
            // Đảm bảo object highScores tồn tại
            if (!user.highScores) user.highScores = {};
            if (!user.highScores[gameType]) user.highScores[gameType] = 0;

            if (score > user.highScores[gameType]) {
                user.highScores[gameType] = score;
                // Báo cho Mongoose biết object này đã thay đổi
                user.markModified('highScores'); 
                message = `Kỷ lục mới! Và +${earnedCoins} vàng!`;
            }
        }

        // --- C. LƯU VÀO DB ---
        await user.save(); 
        console.log("✅ Đã lưu vào Database!");

        // --- D. TRẢ KẾT QUẢ ---
        return res.json({ 
            success: true, 
            message: message, 
            newCoins: user.coins 
        });

    } catch (error) {
        console.error("❌ Lỗi Update Score:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// --- 4. LẤY BẢNG XẾP HẠNG ---
const leaderboard = async (req, res) => {
    try {
        // Lấy tất cả user, chỉ lấy các trường cần thiết
        const leaders = await User.find().select('username highScores coins equippedSkin');
        res.json({ success: true, data: leaders });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" }); 
    }
};

// --- 5. MUA ĐỒ ---
const buyItem = async (req, res) => {
    try {
        const { userId, itemId } = req.body; // Giá tiền lấy từ DB (shopController) sẽ an toàn hơn, nhưng ở đây tạm xử lý nhanh
        // Lưu ý: Nếu muốn an toàn tuyệt đối, nên tách logic Mua sang shopController riêng
        // Nhưng nếu bạn gộp chung, ta cần lấy User trước
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Lỗi User" });

        // Tạm thời hardcode giá để demo (hoặc bạn có thể dùng shopController riêng như bài trước)
        let price = 0;
        if(itemId === 'forest') price = 500;
        if(itemId === 'ice') price = 1000;

        if (user.inventory.includes(itemId)) {
            user.equippedSkin = itemId;
            await user.save();
            return res.json({ success: true, message: "Đã đổi skin!", coins: user.coins, equipped: itemId });
        }

        if (user.coins < price) return res.json({ success: false, message: "Không đủ tiền!" });

        user.coins -= price;
        user.inventory.push(itemId);
        user.equippedSkin = itemId;
        await user.save();

        return res.json({ success: true, message: "Mua thành công!", coins: user.coins, equipped: itemId });

    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// Xuất khẩu module (Đầy đủ 5 hàm)
module.exports = { 
    register, 
    login, 
    leaderboard, 
    updateScore, 
    buyItem 
};