const User = require('../models/User');
const GameHistory = require('../models/GameHistory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Feedback = require('../models/Feedback');
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
                inventory: user.inventory || [], 
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
        
        let currentHighScore = 0;
        if (typeof user.highScores.get === 'function') {
            currentHighScore = user.highScores.get(gameId) || 0;
        } else {
            currentHighScore = user.highScores[gameId] || 0;
        }

        if (score > currentHighScore) {
            if (typeof user.highScores.set === 'function') {
                user.highScores.set(gameId, score);
            } else {
                user.highScores[gameId] = score;
                user.markModified('highScores'); 
            }
        }

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

// --- 7. LẤY THÔNG TIN PROFILE (ĐÃ THÊM AUTO RESET NHIỆM VỤ NGÀY) ---
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password'); 
        
        // Logic Reset Nhiệm Vụ Ngày
        const now = new Date();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : new Date(0);
        
        if (now.toDateString() !== lastLogin.toDateString()) {
            user.quests.dailyLoginClaimed = false;
            user.quests.gamesPlayedToday = 0;
            user.quests.gamesPlayedClaimed = false;
            
            // Tính chuỗi đăng nhập (Streak)
            const diffTime = Math.abs(now - lastLogin);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays <= 2) user.loginStreak += 1;
            else user.loginStreak = 1;

            user.lastLoginDate = now;
            await user.save();
        }

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

// --- 10. BẬT/TẮT YÊU THÍCH GAME ---
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { gameSlug } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        if (!user.favoriteGames) user.favoriteGames = [];

        const index = user.favoriteGames.indexOf(gameSlug);
        if (index > -1) {
            user.favoriteGames.splice(index, 1);
        } else {
            user.favoriteGames.push(gameSlug);
        }

        await user.save();

        res.json({ success: true, favoriteGames: user.favoriteGames });
    } catch (error) {
        console.error('Lỗi toggle favorite:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// --- 11. GỬI GÓP Ý / BÁO LỖI ---
const submitFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung!' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        // Lưu vào CSDL
        await Feedback.create({
            userId: user._id,
            username: user.username,
            content: content
        });

        res.json({ success: true, message: 'Cảm ơn bạn đã góp ý! Lời nhắn đã được gửi đến nhà phát triển.' });
    } catch (error) {
        console.error('Lỗi gửi góp ý:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// --- 12. NHẬN THƯỞNG NHIỆM VỤ ---
const claimQuest = async (req, res) => {
    try {
        const { questId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user" });

        let rewardCoins = 0;
        let rewardExp = 0;

        if (questId === 'dailyLogin' && !user.quests.dailyLoginClaimed) {
            rewardCoins = 50;
            user.quests.dailyLoginClaimed = true;
        } else if (questId === 'play3Games' && user.quests.gamesPlayedToday >= 3 && !user.quests.gamesPlayedClaimed) {
            rewardCoins = 100;
            rewardExp = 50;
            user.quests.gamesPlayedClaimed = true;
        } else if (questId === 'scoreHunter' && user.totalScore >= 10000 && !user.quests.scoreHunterClaimed) {
            rewardCoins = 500;
            user.quests.scoreHunterClaimed = true;
        } else {
            return res.status(400).json({ success: false, message: "Chưa đủ điều kiện hoặc đã nhận rồi!" });
        }

        user.coins += rewardCoins;
        user.exp += rewardExp;
        
        // Xử lý lên cấp nếu đủ exp
        let expNeeded = user.level * 1000;
        while (user.exp >= expNeeded) {
            user.level += 1;
            user.exp -= expNeeded;
            expNeeded = user.level * 1000;
        }

        await user.save();
        res.json({ success: true, message: "Nhận thưởng thành công!", user });
    } catch (error) {
        console.error("Lỗi nhận thưởng:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// --- 13. GẮN HUY HIỆU ---
const equipBadge = async (req, res) => {
    try {
        const { badgeId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "Lỗi User" });

        if (!user.equipped) user.equipped = {};
        user.equipped.badge = badgeId; // badgeId có thể là 'none' để tháo ra
        await user.save();

        res.json({ success: true, message: "Đã cập nhật phụ kiện!", user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};
// Nhớ thêm equipBadge vào module.exports { ... } nhé!
// --- THÊM CHỨC NĂNG ĐỔI TÊN ---
const updateUsername = async (req, res) => {
    try {
        const { newUsername } = req.body;
        const userId = req.user.id;

        // Kiểm tra điều kiện tên
        if (!newUsername || newUsername.trim().length < 3 || newUsername.trim().length > 20) {
            return res.status(400).json({ success: false, message: 'Tên hiển thị phải từ 3 đến 20 ký tự.' });
        }

        // Kiểm tra xem tên này đã có ai dùng chưa (tùy chọn, nếu bạn muốn tên là duy nhất)
        const User = require('../models/User'); // Đảm bảo đã import User model
        const existingUser = await User.findOne({ username: newUsername.trim() });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ success: false, message: 'Tên này đã có người sử dụng, vui lòng chọn tên khác!' });
        }

        // Cập nhật tên mới vào CSDL
        const user = await User.findByIdAndUpdate(
            userId, 
            { username: newUsername.trim() }, 
            { new: true }
        );

        res.json({ 
            success: true, 
            message: 'Đổi tên thành công!', 
            username: user.username 
        });

    } catch (error) {
        console.error("Lỗi updateUsername:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đổi tên' });
    }
};
// --- XUẤT TẤT CẢ CÁC HÀM (ĐÃ BAO GỒM ĐẦY ĐỦ LOGIn/REGISTER) ---
module.exports = { 
    register, 
    login, 
    leaderboard, 
    updateScore, 
    buyItem,
    googleLogin,
    getProfile, 
    updateAvatar,
    getUserInfo,
    toggleFavorite,
    submitFeedback,
    claimQuest,
    equipBadge,
    updateUsername
};