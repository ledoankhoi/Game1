require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');

const DB_URI = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/mathquest';

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Đã kết nối MongoDB');

    const existing = await Game.findOne({ slug: 'othello-multi' });
    if (existing) {
      console.log('Game othello-multi đã tồn tại');
      await mongoose.disconnect();
      process.exit(0);
    }

    await Game.create({
      title: 'Othello Multiplayer',
      slug: 'othello-multi',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529693451587-5a5c5e0a2f3a?w=400',
      gameUrl: '/othello-multi.html',
      category: ['Multiplayer', 'Logic'],
      isActive: true,
      views: 0,
    });

    console.log('Đã tạo game Othello Multiplayer');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

seed();
