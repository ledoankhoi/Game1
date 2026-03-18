const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
    try {
        // req.user.id đã được giải mã từ authMiddleware chạy trước đó
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: "⛔ Chặn cổng! Chỉ Quản Trị Viên mới được vào khu vực này." 
            });
        }
        
        next(); // Nếu đúng là Admin thì mở cửa cho đi tiếp
    } catch (error) {
        console.error("Lỗi kiểm tra quyền Admin:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};


module.exports = adminMiddleware;