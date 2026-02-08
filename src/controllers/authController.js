const User = require('../models/User');

// --- 1. ĐĂNG KÝ ---
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ success: false, message: "Thiếu thông tin!" });
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: "Email đã tồn tại!" });

        await User.create({ username, email, password });
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

        // Kiểm tra User và Mật khẩu
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                scores: user.highScores,
                coins: user.coins || 0,        // Đảm bảo luôn có field này
                equippedSkin: user.equippedSkin
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 3. BẢNG XẾP HẠNG ---
const leaderboard = async (req, res) => {
    try {
        const leaders = await User.find().select('username highScores inventory equippedSkin');
        res.json({ success: true, data: leaders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 4. CẬP NHẬT ĐIỂM & TIỀN (FIXED) ---
const updateScore = async (req, res) => {
    try {
        const { username, score, gameType } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "Không tìm thấy User" });

        // A. CỘNG TIỀN (Luôn chạy)
        let currentCoins = user.coins || 0;
        const earnedCoins = score * 10;
        user.coins = currentCoins + earnedCoins;

        // B. CẬP NHẬT KỶ LỤC
        const validGames = ['monster', 'sequence', 'speed'];
        if (validGames.includes(gameType)) {
            if (!user.highScores[gameType]) user.highScores[gameType] = 0;
            
            if (score > user.highScores[gameType]) {
                user.highScores[gameType] = score;
                user.markModified('highScores');
            }
        }

        // C. LƯU (Quan trọng: Nằm ngoài cùng)
        await user.save();

        return res.json({ 
            success: true, 
            message: `+${earnedCoins} vàng!`, 
            newCoins: user.coins 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// --- 5. MUA ĐỒ ---
const buyItem = async (req, res) => {
    try {
        const { username, itemId, price } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "Lỗi User" });

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

module.exports = { register, login, leaderboard, updateScore, buyItem };