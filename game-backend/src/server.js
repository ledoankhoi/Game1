const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Nạp cấu hình từ file .env
dotenv.config();

// 2. Khởi tạo ứng dụng Express
const app = express();

// 3. Cấu hình Middleware (Bảo vệ và xử lý dữ liệu)
app.use(cors()); // Cho phép Frontend (cổng 5173) gọi dữ liệu từ Backend (cổng 5000)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// ==========================================
// 4. IMPORT VÀ ĐĂNG KÝ CÁC ĐƯỜNG DẪN API
// ==========================================

// Import
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const gameRoutes = require('./routes/gameRoutes'); // <-- Đã thêm API Game
const adminRoutes = require('./routes/adminRoutes');
// Đăng ký
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/games', gameRoutes); // <-- Đã đăng ký API Game
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);
// Thêm một route cơ bản để kiểm tra Server có sống không

const questRoutes = require('./routes/questRoutes');
app.use('/api/quest', questRoutes);

const achievementRoutes = require('./routes/achievementRoutes');
app.use('/api/achievement', achievementRoutes);

app.get('/', (req, res) => {
    res.send('Máy chủ Backend MathQuest đang hoạt động bình thường!');
});

// ==========================================
// 5. KẾT NỐI DATABASE VÀ CHẠY SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/mathquest';

const { chatWithAssistant } = require('./controllers/aiController');
app.post('/api/ai/chat', chatWithAssistant);

mongoose.connect(DB_URI)
    .then(() => {
        console.log('✅ Đã kết nối cơ sở dữ liệu MongoDB thành công!');
        
        // Chỉ bật server lên khi đã kết nối Database thành công
        app.listen(PORT, () => {
            console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Lỗi kết nối Database:', error.message);
    });