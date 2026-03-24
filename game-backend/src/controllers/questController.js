const mongoose = require('mongoose');
const Quest = require('../models/Quest');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

// 1. HÀM LẤY DANH SÁCH & TIẾN ĐỘ
exports.getQuests = async (req, res) => {
    try {
        let rawQuests = await Quest.find().sort({ createdAt: 1 }).lean();
        if (!rawQuests || rawQuests.length === 0) return res.json({ success: true, quests: [] });

        let gamesPlayedToday = 0;
        let userTotalScore = 0;
        let userCoins = 0;
        let userStreak = 1;
        let userClaimedQuests = new Map();

        // Lấy thông tin người dùng nếu đã đăng nhập
        if (req.user && req.user.id) {
            const user = await User.findById(req.user.id);
            if (user) {
                userTotalScore = user.totalScore || 0;
                userCoins = user.coins || 0;
                userStreak = user.loginStreak || 1;
                if (user.claimedQuests) userClaimedQuests = user.claimedQuests;

                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                gamesPlayedToday = await GameHistory.countDocuments({
                    userId: new mongoose.Types.ObjectId(req.user.id), 
                    createdAt: { $gte: startOfDay }
                });
            }
        }

        // Chuẩn hóa và tính toán dữ liệu gửi về Frontend
        let formattedQuests = rawQuests.map(q => {
            let questId = q.id || q._id.toString();
            let currentProgress = 0;
            let isClaimed = false;

            // Tính Tiến độ (Current Progress) cho TẤT CẢ nhiệm vụ
            if (questId === 'dailyLogin') currentProgress = 1;
            else if (['firstGame', 'play3Games', 'play10Games', 'win5Games'].includes(questId)) currentProgress = gamesPlayedToday;
            else if (questId === 'earn1000Coins') currentProgress = userCoins;
            else if (questId === 'scoreHunter') currentProgress = userTotalScore;
            else if (questId === 'streak3Days') currentProgress = userStreak;

            // Kiểm tra trạng thái "Đã nhận thưởng chưa" (isClaimed)
            if (userClaimedQuests.has(questId)) {
                const lastClaimed = new Date(userClaimedQuests.get(questId));
                const now = new Date();
                
                if (q.type === 'daily') {
                    if (lastClaimed.toDateString() === now.toDateString()) isClaimed = true; // Cùng ngày
                } else if (q.type === 'weekly') {
                    const diffDays = Math.ceil(Math.abs(now - lastClaimed) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 7) isClaimed = true; // Trong vòng 7 ngày
                } else {
                    isClaimed = true; // Milestone (Mốc) chỉ nhận 1 lần trọn đời
                }
            }

            return { ...q, id: questId, currentProgress, isClaimed };
        });

        res.json({ success: true, quests: formattedQuests });
    } catch (error) {
        console.error("Lỗi getQuests:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

// 2. HÀM XỬ LÝ KHI NGƯỜI CHƠI BẤM NÚT "NHẬN THƯỞNG"
exports.claimQuest = async (req, res) => {
    try {
        const { questId } = req.body;
        const user = await User.findById(req.user.id);
        const quest = await Quest.findOne({ id: questId });

        if (!user || !quest) return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu!" });

        // Kiểm tra xem đã nhận hôm nay/tuần này chưa (Chống hack click nhiều lần)
        if (user.claimedQuests && user.claimedQuests.has(questId)) {
            const lastClaimed = new Date(user.claimedQuests.get(questId));
            const now = new Date();
            if (quest.type === 'daily' && lastClaimed.toDateString() === now.toDateString()) {
                return res.status(400).json({ success: false, message: "Bạn đã nhận thưởng nhiệm vụ này hôm nay rồi!" });
            }
        }

        // Trả thưởng
        user.coins = (user.coins || 0) + quest.rewardCoins;
        user.exp = (user.exp || 0) + quest.rewardExp;

        // Logic Thăng cấp (Dựa theo công thức currentLevel * 1000 của Frontend)
        let currentLevel = user.level || 1;
        let expNeeded = currentLevel * 1000;
        while (user.exp >= expNeeded) {
            user.exp -= expNeeded; // Trừ exp đã dùng để lên cấp
            currentLevel++;
            expNeeded = currentLevel * 1000;
        }
        user.level = currentLevel;

        // Đánh dấu đã nhận thưởng vào "Túi đồ"
        if (!user.claimedQuests) user.claimedQuests = new Map();
        user.claimedQuests.set(questId, new Date());

        await user.save(); // Lưu vào DB

        // Trả về dữ liệu mới để Frontend cập nhật ngay lập tức
        res.json({
            success: true,
            message: `Nhận thành công ${quest.rewardCoins} Xu và ${quest.rewardExp} XP!`,
            user: { id: user._id, username: user.username, coins: user.coins, exp: user.exp, level: user.level, avatarUrl: user.avatarUrl }
        });

    } catch (error) {
        console.error("Lỗi claimQuest:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};