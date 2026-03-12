const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Lấy "Vé" (Token) từ thẻ Header của người dùng gửi lên
    const token = req.header('Authorization');
    
    // Nếu không có vé -> Đuổi ra ngoài
    if (!token) {
        return res.status(401).json({ success: false, message: 'Từ chối truy cập. Không có vé (token)!' });
    }

    try {
        // 2. Kiểm tra vé xem có phải hàng giả không (Bỏ chữ 'Bearer ' ở đầu đi)
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        
        // 3. Giải mã vé
        const verified = jwt.verify(tokenString, process.env.JWT_SECRET || 'secret');
        
        // 4. Mở cửa cho vào, dán thẻ tên người dùng vào req.user để Shop biết ai đang mua đồ
        req.user = verified; 
        next(); 

    } catch (error) {
        res.status(400).json({ success: false, message: 'Vé (token) hết hạn hoặc không hợp lệ!' });
    }
};

// BẮT BUỘC LÀ XUẤT THẲNG HÀM (Không có dấu ngoặc nhọn {})
module.exports = authMiddleware;