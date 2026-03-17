const User = require('../models/User');
const GameHistory = require('../models/GameHistory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Cấu hình Google Client
const CLIENT_ID = "424857046874-ag5tmbrp5b7951u7185d7b78ttkflvhj.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// --- 1. ĐĂNG KÝ ---
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin!" });
        }
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email hoặc Tên đã tồn tại!" });
        }
        await User.create({ 
            username, 
            email, 
            password, 
            coins: 100 // Tặng 100 coin khởi nghiệp
        });
        res.status(201).json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 2. ĐĂNG NHẬP (Bằng Email/Mật khẩu) ---
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins || 0,
                level: user.level || 1,
                inventory: user.inventory || [], // <--- THÊM DÒNG NÀY ĐỂ TRẢ VỀ TÚI ĐỒ
                equipped: user.equipped,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 3. ĐĂNG NHẬP GOOGLE ---
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body; 
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: CLIENT_ID 
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                googleId: googleId,
                email: email,
                username: name,
                avatarUrl: picture,
                coins: 500,
                level: 1,
                inventory: ['skin_default', 'face_smile'],
                equipped: { skin: 'skin_default', face: 'face_smile' }
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.avatarUrl = picture;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins,
                level: user.level,
                inventory: user.inventory,
                avatarUrl: user.avatarUrl,
                equipped: user.equipped,
                role: user.role
            }
        });
    } catch (error) {
        console.error("❌ Lỗi đăng nhập Google:", error);
        res.status(500).json({ success: false, message: "Lỗi xác thực Google" });
    }
};

// --- 4. CẬP NHẬT ĐIỂM, TIỀN & LỊCH SỬ ---
const updateScore = async (req, res) => {
    try {
        const { gameId, score } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

        const coinsEarned = Math.floor(score / 10); 
        const expEarned = score;                    

        user.coins += coinsEarned;
        user.exp = (user.exp || 0) + expEarned;
        user.totalScore = (user.totalScore || 0) + score;

        let expNeeded = user.level * 1000;
        let leveledUp = false;
        while (user.exp >= expNeeded) {
            user.level += 1;
            user.exp -= expNeeded;
            expNeeded = user.level * 1000;
            leveledUp = true;
        }

        // 4. Lưu kỷ lục cao nhất (Bọc thép 2 lớp)
        if (!user.highScores) user.highScores = {}; 
        
        // Kiểm tra kỷ lục cũ một cách an toàn
        let currentHighScore = 0;
        if (typeof user.highScores.get === 'function') {
            currentHighScore = user.highScores.get(gameId) || 0;
        } else {
            currentHighScore = user.highScores[gameId] || 0;
        }

        // Nếu điểm mới cao hơn thì phá kỷ lục
        if (score > currentHighScore) {
            if (typeof user.highScores.set === 'function') {
                user.highScores.set(gameId, score);
            } else {
                user.highScores[gameId] = score;
                user.markModified('highScores'); 
            }
        }


        // Ghi lại lịch sử chơi game
        await GameHistory.create({
            userId: userId,
            username: user.username,
            gameId: gameId,
            score: score
        });

        res.json({ 
            success: true, 
            message: leveledUp ? 'Chúc mừng bạn đã lên cấp!' : 'Đã nhận thưởng!',
            coinsEarned,
            expEarned,
            newLevel: user.level,
            newCoins: user.coins,
            role: user.role
        });
    } catch (error) {
        console.error("❌ Lỗi xử lý điểm số:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// --- 5. LẤY DỮ LIỆU BẢNG XẾP HẠNG ---
const leaderboard = async (req, res) => {
    try {
        const leaders = await User.find().select('username highScores coins level totalScore');
        res.json({ success: true, data: leaders });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi Server" }); 
    }
};

// --- 6. MUA ĐỒ ---
const buyItem = async (req, res) => {
    try {
        const { userId, itemId } = req.body; 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Lỗi User" });

        let price = (itemId === 'forest') ? 500 : (itemId === 'ice' ? 1000 : 0);

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

// --- 7. LẤY THÔNG TIN PROFILE ---
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password'); // Lấy hết trừ mật khẩu
        
        // Đếm xem người này đã chơi bao nhiêu ván game
        const gamesPlayed = await GameHistory.countDocuments({ userId: userId });

        res.json({ success: true, user, gamesPlayed });
    } catch (error) {
        console.error("Lỗi lấy Profile:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 8. CẬP NHẬT AVATAR ---
const updateAvatar = async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy User" });

        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({ success: true, message: "Đã cập nhật Avatar!", avatarUrl });
    } catch (error) {
        console.error("Lỗi cập nhật Avatar:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }

};

// --- 9. LẤY THÔNG TIN USER (Dành cho đồng bộ Shop) ---
const getUserInfo = async (req, res) => {
    try {
        // req.user.id có được là nhờ authMiddleware đã giải mã token
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy User" });
        }

        res.json({ success: true, user: user });
    } catch (error) {
        console.error("Lỗi lấy thông tin User:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- XUẤT TẤT CẢ CÁC HÀM ---
module.exports = { 
    register, 
    login, 
    leaderboard, 
    updateScore, 
    buyItem,
    googleLogin,
    getProfile, 
    updateAvatar,
    getUserInfo
};