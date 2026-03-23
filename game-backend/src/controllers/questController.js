const Quest = require('../models/Quest');

exports.getQuests = async (req, res) => {
    try {
        let quests = await Quest.find();
        
        // AUTO-SEED: Nếu CSDL trống, tự động bơm 4 nhiệm vụ này vào MongoDB
        if (quests.length === 0) {
            const defaultQuests = [
                { id: 'dailyLogin', title: 'Điểm Danh Mỗi Ngày', type: 'daily', requirement: 1, rewardCoins: 50, rewardExp: 10, icon: 'login', color: 'green' },
                { id: 'play3Games', title: 'Chơi 3 Ván Game', type: 'daily', requirement: 3, rewardCoins: 100, rewardExp: 50, icon: 'sports_esports', color: 'blue' },
                { id: 'win5Games', title: 'Thắng 5 Ván Trong Tuần', type: 'weekly', requirement: 5, rewardCoins: 300, rewardExp: 100, icon: 'emoji_events', color: 'purple' },
                { id: 'scoreHunter', title: 'Thợ Săn Điểm Số', type: 'milestone', requirement: 10000, rewardCoins: 500, rewardExp: 0, icon: 'workspace_premium', color: 'red' }
            ];
            await Quest.insertMany(defaultQuests);
            quests = await Quest.find(); // Lấy lại sau khi đã bơm vào
            console.log("Đã tự động tạo các Nhiệm vụ cơ bản vào Database!");
        }

        res.json({ success: true, quests });
    } catch (error) {
        console.error("Lỗi lấy danh sách quest:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};