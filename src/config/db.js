/* File: src/config/db.js */
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Kết nối với chuỗi trong .env hoặc mặc định localhost
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/MathQuestDB');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;