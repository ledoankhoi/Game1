const mongoose = require('mongoose');
const { app, server } = require('./app');

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/mathquest';

mongoose.connect(DB_URI)
    .then(() => {
        console.log('✅ Đã kết nối cơ sở dữ liệu MongoDB thành công!');
        server.listen(PORT, () => {
            console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Lỗi kết nối Database:', error.message);
    });