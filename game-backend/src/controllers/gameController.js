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

// 1. Lấy Bảng xếp hạng của 1 game cụ thể (VD: Top 10 người bắn quái vật giỏi nhất)
exports.getGameLeaderboard = async (req, res) => {
    try {
        const { gameId } = req.params; // Lấy tên game từ URL (VD: /api/game/leaderboard/monster)

        // Tìm những user có điểm của game này, xếp từ cao xuống thấp, lấy 10 người
        const topUsers = await User.find({ [`highScores.${gameId}`]: { $exists: true } })
                                   .sort({ [`highScores.${gameId}`]: -1 })
                                   .limit(10)
                                   .select('username avatarUrl equipped highScores level');

        // Gọt đẽo lại dữ liệu cho gọn gàng trước khi gửi về Web
        const formattedBoard = topUsers.map(u => ({
            username: u.username,
            avatarUrl: u.avatarUrl,
            equipped: u.equipped,
            level: u.level,
            score: u.highScores.get(gameId) // Chỉ lấy điểm của đúng game đang cần
        }));

        res.json({ success: true, leaderboard: formattedBoard });
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