const Achievement = require('../models/Achievement');

exports.getAchievements = async (req, res) => {
    try {
        // 1. Đọc dữ liệu từ MongoDB (sắp xếp theo requirement để cái dễ lên trước)
        let rawAchievements = await Achievement.find().sort({ requirement: 1 }).lean();
        
        // Nếu DB trống, báo mảng rỗng về cho Frontend
        if (!rawAchievements || rawAchievements.length === 0) {
            console.log("⚠️ CSDL Thành tựu đang trống. Vui lòng thêm dữ liệu vào MongoDB.");
            return res.json({ success: true, achievements: [] });
        }

        // 2. Chuẩn hóa ID để giao diện Web luôn nhận diện được
        let formattedAchievements = rawAchievements.map(ach => {
            return {
                ...ach,
                id: ach.id || (ach._id ? ach._id.toString() : '')
            };
        });

        // 3. Trả kết quả về
        res.json({ success: true, achievements: formattedAchievements });

    } catch (error) {
        console.error("❌ Lỗi lấy danh sách thành tựu:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};