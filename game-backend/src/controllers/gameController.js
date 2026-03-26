const User = require('../models/User');
const GameHistory = require('../models/GameHistory');
const Game = require('../models/Game');
const { updateGameProgress } = require('../services/progressService');
const recommendationService = require('../services/recommendationService');
const GameInstruction = require('../models/GameInstruction');

// Lấy danh sách toàn bộ Game hiển thị ra Sảnh
exports.getAllGames = async (req, res) => {
    try {
       const isAdmin = req.user && req.user.role === 'admin';
        let query = {};
        if (!isAdmin) {
            query = { isActive: { $ne: false } };
        } 
        const games = await Game.find(query).sort({ createdAt: -1 });
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
        const users = await User.find({ 'highScores': { $exists: true } })
            .select('username avatarUrl equipped highScores level');

        let topUsers = users.map(u => {
            let score = 0;
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

        topUsers = topUsers.filter(u => u.score > 0);
        topUsers.sort((a, b) => b.score - a.score);
        const formattedUsers = topUsers.slice(0, 10);

        res.json({ success: true, leaderboard: formattedUsers });
    } catch (error) {
        console.error("Lỗi lấy BXH Game:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 2. Lấy Lịch sử chơi game
exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await GameHistory.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, history });
    } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 3. Lấy Top Kinh Nghiệm
exports.getTopExp = async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({ level: -1, exp: -1 })
            .limit(50)
            .select('username avatarUrl equipped level exp');
        res.json({ success: true, leaderboard: topUsers });
    } catch (error) {
        console.error("Lỗi lấy Top EXP:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 4. Lấy Top Tổng Điểm
exports.getTopScore = async (req, res) => {
    try {
        const topUsers = await User.find({}) 
            .sort({ totalScore: -1 }) 
            .limit(50)
            .select('username avatarUrl equipped level totalScore');

        const formattedUsers = topUsers.map(user => ({
            ...user._doc, 
            totalScore: user.totalScore || 0 
        }));

        res.json({ success: true, leaderboard: formattedUsers });
    } catch (error) {
        console.error("Lỗi lấy Top Điểm:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 5. Xử lý nhận thưởng sau khi chơi xong
exports.saveGameResult = async (req, res) => {
    try {
        const { gameId, score, coinsEarned, expEarned } = req.body;
        const userId = req.user.id; 

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy User" });

        user.coins = (user.coins || 0) + coinsEarned;
        user.exp = (user.exp || 0) + expEarned;
        user.level = user.level || 1;
        user.totalScore = (user.totalScore || 0) + score;

        if (!user.highScores) user.highScores = {};
        let currentHighScore = 0;
        if (user.highScores instanceof Map) {
            currentHighScore = user.highScores.get(gameId) || 0;
            if (score > currentHighScore) user.highScores.set(gameId, score);
        } else {
            currentHighScore = user.highScores[gameId] || 0;
            if (score > currentHighScore) user.highScores[gameId] = score;
        }

        let leveledUp = false;
        const baseLevelExp = 1000;
        const expMultiplier = 1.5;
        let expNeeded = Math.floor(baseLevelExp * Math.pow(expMultiplier, user.level - 1));

        while (user.exp >= expNeeded) {
            user.exp -= expNeeded;
            user.level += 1;
            leveledUp = true;
            expNeeded = Math.floor(baseLevelExp * Math.pow(expMultiplier, user.level - 1));
        }

        const unlockedItems = updateGameProgress(user, score);
        await user.save();

        await GameHistory.create({
            userId: user._id,
            username: user.username,
            gameId: gameId,
            score: score,
            coinsEarned: coinsEarned,
            expEarned: expEarned
        });

        res.json({ 
            success: true, 
            leveledUp: leveledUp,
            unlockedItems: unlockedItems, 
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

// 6. Tính tổng điểm theo thể loại
exports.getCategoryLeaderboard = async (req, res) => {
    try {
        const { category } = req.params;
        const query = category === 'All' ? {} : { category: category };
        
        const gamesInCategory = await Game.find(query);
        const gameIds = gamesInCategory.map(g => g.slug); 

        if (gameIds.length === 0) {
            return res.json({ success: true, leaderboard: [] });
        }

        const users = await User.find({ 'highScores': { $exists: true } })
            .select('username avatarUrl equipped level highScores');

        let topUsers = users.map(u => {
            let catScore = 0;
            gameIds.forEach(id => {
                if (u.highScores instanceof Map) {
                    catScore += u.highScores.get(id) || 0;
                } else if (u.highScores && typeof u.highScores === 'object') {
                    catScore += u.highScores[id] || 0;
                }
            });
            return {
                username: u.username,
                avatarUrl: u.avatarUrl,
                equipped: u.equipped,
                level: u.level,
                score: catScore 
            };
        });

        topUsers = topUsers.filter(u => u.score > 0);
        topUsers.sort((a, b) => b.score - a.score);

        res.json({ success: true, leaderboard: topUsers.slice(0, 50) });
    } catch (error) {
        console.error("Lỗi lấy BXH Thể loại:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};


exports.getAIRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        // 1. Lấy lịch sử chơi game của User này
        const history = await GameHistory.find({ userId }).limit(20);
        const playedGameSlugs = history.map(h => h.gameId);
        const favoriteSlugs = user.favoriteGames || [];

        // 2. Thống kê xem thể loại nào xuất hiện nhiều nhất (Sở thích)
        const allInteractions = [...playedGameSlugs, ...favoriteSlugs];
        const interactiveGames = await Game.find({ slug: { $in: allInteractions } });
        
        const categoryCount = {};
        interactiveGames.forEach(game => {
            const cats = Array.isArray(game.category) ? game.category : [game.category];
            cats.forEach(cat => {
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            });
        });

        // Tìm thể loại "ruột" (ví dụ: 'Math', 'Logic')
        const topCategories = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a]).slice(0, 2);

        // 3. Gợi ý những game thuộc thể loại đó mà User CHƯA chơi/thích
        const recommendedGames = await Game.find({
            category: { $in: topCategories },
            slug: { $nin: allInteractions }, // Tránh gợi ý lại game cũ
            isActive: true
        }).limit(6);

        res.json({ success: true, games: recommendedGames });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống gợi ý" });
    }
};

exports.getAIRecommendations = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        // 1. Chuẩn bị dữ liệu: Lấy tất cả Game và User
        const allGames = await Game.find({ isActive: true }).select('slug');
        const allGameSlugs = allGames.map(g => g.slug);
        
        const allUsers = await User.find().select('_id favoriteGames');
        const allHistory = await GameHistory.find().select('userId gameId');

        // 2. Xây dựng Vector cho từng User
        // Mỗi User sẽ có 1 mảng [0, 1, 0...] tương ứng với danh sách allGameSlugs
        const buildVector = (userId, userFavs) => {
            const userHistory = allHistory.filter(h => h.userId.toString() === userId.toString());
            const playedSlugs = userHistory.map(h => h.gameId);
            
            return allGameSlugs.map(slug => 
                (userFavs.includes(slug) || playedSlugs.includes(slug)) ? 1 : 0
            );
        };

        const userVectors = {};
        let currentUserVector = [];

        allUsers.forEach(u => {
            const vector = buildVector(u._id, u.favoriteGames || []);
            if (u._id.toString() === currentUserId) {
                currentUserVector = vector;
            } else {
                userVectors[u._id.toString()] = vector;
            }
        });

        // 3. Chạy thuật toán KNN
        const recommendedSlugs = recommendationService.getKNNRecommendations(
            currentUserVector, 
            userVectors, 
            allGameSlugs
        );

        // 4. Lấy thông tin chi tiết các game được gợi ý
        const games = await Game.find({ slug: { $in: recommendedSlugs.slice(0, 6) } });

        res.json({ success: true, games });
    } catch (error) {
        console.error("Lỗi AI Recommendation:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống gợi ý AI" });
    }
};

exports.getGameInfo = async (req, res) => {
    try {
        const { slug } = req.params;
        const game = await Game.findOne({ slug: slug });
        
        if (!game) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy trò chơi' });
        }
        
        res.json({ success: true, game });
    } catch (error) {
        console.error("Lỗi lấy thông tin game:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

exports.getGameInstructions = async (req, res) => {
    try {
        const slug = req.params.slug; // Lấy mã game từ thanh địa chỉ
        
        // Tìm trong CSDL bảng GameInstruction xem có mã gameSlug nào khớp không
        const instruction = await GameInstruction.findOne({ gameSlug: slug });
        
        if (!instruction || !instruction.howToPlay) {
            return res.status(404).json({ success: false, message: 'Chưa có hướng dẫn cho trò chơi này.' });
        }
        
        // Trả mảng howToPlay về cho Frontend
        res.json({ success: true, howToPlay: instruction.howToPlay });
    } catch (error) {
        console.error("Lỗi lấy thông tin hướng dẫn game:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};