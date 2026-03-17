const User = require('../models/User');
const GameHistory = require('../models/GameHistory');


const Game = require('../models/Game'); // Đảm bảo đã import model Game

// Lấy danh sách toàn bộ Game hiển thị ra Sảnh
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.json({ success: true, games });
    } catch (error) {
        console.error("Lỗi lấy danh sách game:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 1. Lấy Bảng xếp hạng của 1 game cụ thể
exports.getGameLeaderboard = async (req, res) => {
    try {
        const { gameId } = req.params;

        // Lấy TẤT CẢ user có trường highScores
        const users = await User.find({ 'highScores': { $exists: true } })
            .select('username avatarUrl equipped highScores level');

        // Lọc và sắp xếp thủ công (chắc chắn nhất)
        let topUsers = users.map(u => {
            let score = 0;
            // Kiểm tra xem highScores là Map hay Object
            if (u.highScores instanceof Map) {
                score = u.highScores.get(gameId) || 0;
            } else if (u.highScores && typeof u.highScores === 'object') {
                score = u.highScores[gameId] || 0;
            }

            return {
                username: u.username,
                avatarUrl: u.avatarUrl,
                equipped: u.equipped,
                level: u.level,
                score: score
            };
        });

        // Chỉ lấy những người có điểm > 0 ở game này
        topUsers = topUsers.filter(u => u.score > 0);

        // Sắp xếp từ cao xuống thấpa
        topUsers.sort((a, b) => b.score - a.score);

        // Lấy Top 10
        const formattedUsers = topUsers.slice(0, 10);

        res.json({ success: true, leaderboard: formattedUsers });
    } catch (error) {
        console.error("Lỗi lấy BXH Game:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 2. Lấy Lịch sử chơi game của tài khoản đang đăng nhập
exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        // Lấy 20 ván chơi gần nhất, xếp theo thời gian mới nhất lên đầu
        const history = await GameHistory.find({ userId }).sort({ createdAt: -1 }).limit(20);
        
        res.json({ success: true, history });
    } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 1. Lấy Top Kinh Nghiệm (Cày level)
exports.getTopExp = async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({ level: -1, exp: -1 }) // Ưu tiên Level trước, nếu bằng Level thì xét EXP
            .limit(50)
            .select('username avatarUrl equipped level exp');
        res.json({ success: true, leaderboard: topUsers });
    } catch (error) {
        console.error("Lỗi lấy Top EXP:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 2. Lấy Top Tổng Điểm (Cày điểm)
exports.getTopScore = async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({ totalScore: -1 }) // Chỉ xét tổng điểm
            .limit(50)
            .select('username avatarUrl equipped level totalScore');
        res.json({ success: true, leaderboard: topUsers });
    } catch (error) {
        console.error("Lỗi lấy Top Điểm:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// --- THÊM ĐOẠN NÀY VÀO CUỐI FILE gameController.js ---

// 3. Xử lý nhận thưởng sau khi chơi xong (Lưu điểm, Vàng, EXP)
exports.saveGameResult = async (req, res) => {
    try {
        const { gameId, score, coinsEarned, expEarned } = req.body;
        
        // Lấy ID user từ token (do middleware auth cung cấp)
        const userId = req.user.id; 

        // 1. Tìm User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy User" });

        // 2. Cộng Vàng và EXP
        user.coins = (user.coins || 0) + coinsEarned;
        user.exp = (user.exp || 0) + expEarned;
        user.level = user.level || 1;
        user.totalScore = (user.totalScore || 0) + score;

        // 3. Kiểm tra và Lưu Điểm Cao (High Score) cho Game hiện tại
        if (!user.highScores) user.highScores = {};
        
        // Xử lý an toàn cho cả Object thường và Mongoose Map
        let currentHighScore = 0;
        if (user.highScores instanceof Map) {
            currentHighScore = user.highScores.get(gameId) || 0;
            if (score > currentHighScore) user.highScores.set(gameId, score);
        } else {
            currentHighScore = user.highScores[gameId] || 0;
            if (score > currentHighScore) user.highScores[gameId] = score;
        }

        // 4. Thuật toán thăng cấp (Level Up)
        let leveledUp = false;
        const baseLevelExp = 1000;
        const expMultiplier = 1.5;
        let expNeeded = Math.floor(baseLevelExp * Math.pow(expMultiplier, user.level - 1));

        // Dùng vòng lặp while đề phòng trường hợp nhận 1 lúc quá nhiều EXP lên 2, 3 cấp
        while (user.exp >= expNeeded) {
            user.exp -= expNeeded;
            user.level += 1;
            leveledUp = true;
            expNeeded = Math.floor(baseLevelExp * Math.pow(expMultiplier, user.level - 1));
        }

        // Lưu User cập nhật vào CSDL
        await user.save();

        // 5. Ghi nhận vào Bảng Lịch Sử (Để làm BXH Lịch sử)
        await GameHistory.create({
            userId: user._id,
            username: user.username,
            gameId: gameId,
            score: score,
            coinsEarned: coinsEarned,
            expEarned: expEarned
        });

        // 6. Trả kết quả về cho Frontend (rewardManager.js)
        res.json({ 
            success: true, 
            leveledUp: leveledUp,
            user: {
                id: user._id,
                username: user.username,
                coins: user.coins,
                exp: user.exp,
                level: user.level,
                avatarUrl: user.avatarUrl
            }
        });

    } catch (error) {
        console.error("Lỗi khi lưu kết quả Game:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lưu điểm' });
    }
};