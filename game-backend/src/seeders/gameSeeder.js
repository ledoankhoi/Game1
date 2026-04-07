const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load biến môi trường từ file .env (để lấy link kết nối Database)
dotenv.config();

// Import Model Game của bạn
const Game = require('../models/Game'); 

const sampleGames = [
  {
    title: "Galaxy Striker",
    slug: "monster",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600",
    gameUrl: "/monster.html",
    category: "Math",
    views: 154200
  },
  {
    title: "Pattern Finder",
    slug: "sequence",
    thumbnailUrl: "https://images.unsplash.com/photo-1620207418302-439b387441b0?q=80&w=600",
    gameUrl: "/sequence.html",
    category: "Logic",
    views: 89000
  },
  {
    title: "Speed Math",
    slug: "speed",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600",
    gameUrl: "/speed.html",
    category: "Speed",
    views: 210500
  },
  {
    title: "Maze Protocol 01",
    slug: "maze",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600",
    gameUrl: "/maze.html",
    category: "Memory",
    views: 75300
  },
  {
    title: "Minesweeper Maze",
    slug: "minesweeper",
    thumbnailUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600",
    gameUrl: "/minesweeper_maze.html",
    category: "Logic",
    views: 62100
  },
  {
    title: "Chiến Thuật Thoát Hiểm",
    slug: "escape",
    thumbnailUrl: "https://images.unsplash.com/photo-1616499370260-485b3e5ed653?q=80&w=600",
    gameUrl: "/escape.html",
    category: "Elite",
    views: 48900
  },
  {
    title: "Rattan March",
    slug: "chess",
    thumbnailUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=600",
    gameUrl: "/chess.html",
    category: "Logic",
    views: 112000
  },
  {
    title: "Signal Decryption",
    slug: "puzzle",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600",
    gameUrl: "/puzzle.html",
    category: "Memory",
    views: 94000
  },
  {
    title: "Pixel Painting 3",
    slug: "pixel",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600", // Tạm dùng ảnh thay thế
    gameUrl: "/pixel.html",
    category: "Elite",
    views: 35000
  }
];

const seedDB = async () => {
  try {
    // Kết nối Database (Thay DB_URI bằng MONGO_URI nếu file .env của bạn đặt tên khác)
    const dbUri = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/mathquest';
    await mongoose.connect(dbUri);
    console.log('✅ Đã kết nối tới Database thành công!');

    // Xóa trắng dữ liệu cũ để tránh bị trùng lặp khi chạy nhiều lần
    await Game.deleteMany({});
    console.log('🗑️ Đã dọn dẹp dữ liệu game cũ.');

    // Thêm toàn bộ mảng game mới vào Database
    await Game.insertMany(sampleGames);
    console.log('🎉 Đã thêm toàn bộ game mới thành công! Hệ thống sẵn sàng.');

    // Thoát chương trình
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu:', error);
    process.exit(1);
  }
};

seedDB();