const mongoose = require('mongoose');

// Kết nối tới Database nằm ngay trong máy tính của bạn (Localhost)
// Không cần User/Password gì cả, rất khỏe!
const connectionString = "mongodb://127.0.0.1:27017/GameToanLogic";

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString);
        console.log("✅ Đã kết nối thành công với MongoDB Local!");
        console.log("   (Dữ liệu đang được lưu trong máy tính của bạn)");
    } catch (error) {
        console.error("❌ Lỗi kết nối Local:", error.message);
        process.exit(1); 
    }
};

module.exports = connectDB;