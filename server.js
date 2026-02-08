const express = require('express');
const cors = require('cors'); // <--- MỚI: Thư viện cho phép trình duyệt gửi dữ liệu
const connectDB = require('./src/config/db'); // <--- MỚI: Gọi file kết nối Database bạn vừa sửa
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const port = 3000;

// --- 1. KẾT NỐI DATABASE ---
// Chạy hàm kết nối ngay khi server khởi động
connectDB(); // <--- MỚI: Kích hoạt kết nối tới MongoDB Atlas

// --- 2. MIDDLEWARE (Bộ lọc) ---
app.use(cors()); // <--- MỚI: Mở cửa cho Frontend truy cập
app.use(express.json()); // Đọc dữ liệu JSON
app.use(express.static('public')); // Phục vụ file giao diện

// --- 3. ROUTES (Định tuyến) ---
// Khi ai đó vào đường dẫn /api/auth/..., chuyển cho authRoutes xử lý
app.use('/api/auth', authRoutes);

// --- 4. KHỞI CHẠY ---
app.listen(port, () => {
    console.log(`===========================================`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
    console.log(`📡 Đang kết nối tới MongoDB...`);
    console.log(`===========================================`);
});