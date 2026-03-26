const User = require('../models/User');
const Game = require('../models/Game');

// Hàm tính khoảng cách Euclidean giữa 2 mảng (vector)
function calculateEuclideanDistance(vecA, vecB) {
    let sum = 0;
    // Giả sử mảng là danh sách các slug game đã chơi/yêu thích [1, 0, 1, ...]
    for (let i = 0; i < vecA.length; i++) {
        sum += Math.pow((vecA[i] || 0) - (vecB[i] || 0), 2);
    }
    return Math.sqrt(sum);
}

exports.getRecommendedGames = async (req, res) => {
    try {
        const currentUserId = req.user.id; // Lấy từ middleware verify token
        
        // 1. Lấy tất cả người dùng và danh sách game
        const users = await User.find().select('_id favoriteGames');
        const allGames = await Game.find().select('slug');
        const gameSlugs = allGames.map(g => g.slug);

        // 2. Tạo Vector (Ma trận) cho từng User (1: Có chơi/yêu thích, 0: Không)
        const userVectors = {};
        users.forEach(user => {
            userVectors[user._id.toString()] = gameSlugs.map(slug => 
                (user.favoriteGames && user.favoriteGames.includes(slug)) ? 1 : 0
            );
        });

        const targetVector = userVectors[currentUserId];
        if (!targetVector) return res.json({ success: true, recommendations: [] });

        // 3. Tìm khoảng cách tới tất cả người dùng khác (Láng giềng)
        let distances = [];
        for (const [userId, vector] of Object.entries(userVectors)) {
            if (userId !== currentUserId) {
                const distance = calculateEuclideanDistance(targetVector, vector);
                distances.push({ userId, distance, vector });
            }
        }

        // 4. Chọn K (ví dụ K=3) láng giềng gần nhất (khoảng cách ngắn nhất)
        distances.sort((a, b) => a.distance - b.distance);
        const kNearest = distances.slice(0, 3);

        // 5. Tổng hợp game từ láng giềng mà user hiện tại CHƯA chơi
        const recommendedSlugs = new Set();
        kNearest.forEach(neighbor => {
            neighbor.vector.forEach((val, index) => {
                // Nếu láng giềng thích (val === 1) và user hiện tại chưa thích (targetVector === 0)
                if (val === 1 && targetVector[index] === 0) {
                    recommendedSlugs.add(gameSlugs[index]);
                }
            });
        });

        // 6. Trả về thông tin các game được gợi ý
        const recommendedGames = await Game.find({ slug: { $in: Array.from(recommendedSlugs) } });
        res.json({ success: true, games: recommendedGames });

    } catch (error) {
        console.error("Lỗi AI Recommendation:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống gợi ý" });
    }
};