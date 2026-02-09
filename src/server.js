/* File: src/server.js */
require('dotenv').config(); // Đọc file .env từ thư mục gốc
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Đảm bảo bạn có file db.js

// Kết nối Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- QUAN TRỌNG: Cấu hình phục vụ file tĩnh (HTML, CSS, JS) ---
// Vì server.js nằm trong 'src', ta phải đi ra ngoài 1 cấp ('../') để thấy 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Routes API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));

// Route mặc định: Trả về trang chủ nếu không gọi API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});