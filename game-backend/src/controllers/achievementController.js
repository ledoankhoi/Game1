const Achievement = require('../models/Achievement');

exports.getAchievements = async (req, res) => {
    try {
        let achievements = await Achievement.find();
        
        // AUTO-SEED: Tự động bơm dữ liệu nếu CSDL trống
        if (achievements.length === 0) {
            const defaultAchievements = [
                { id: 'rookie', title: 'Tân Binh', description: 'Tạo tài khoản thành công', targetType: 'level', requirement: 1, icon: 'verified', color: 'orange' },
                { id: 'firstBlood', title: 'Khởi Động', description: 'Hoàn thành ván game đầu tiên', targetType: 'gamesPlayed', requirement: 1, icon: 'sports_esports', color: 'blue' },
                { id: 'richMan', title: 'Đại Gia', description: 'Sở hữu 10,000 Xu', targetType: 'coins', requirement: 10000, icon: 'monetization_on', color: 'yellow' },
                { id: 'streak7', title: 'Chuỗi Thắng', description: 'Đăng nhập 7 ngày liên tiếp', targetType: 'streak', requirement: 7, icon: 'local_fire_department', color: 'red' }
            ];
            await Achievement.insertMany(defaultAchievements);
            achievements = await Achievement.find();
            console.log("Đã tự động tạo các Thành tựu cơ bản vào Database!");
        }

        res.json({ success: true, achievements });
    } catch (error) {
        console.error("Lỗi lấy danh sách thành tựu:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};