require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');

const DB_URI = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/mathquest';

async function addMultiplayerCategory() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Đã kết nối MongoDB');

    const game = await Game.findOne({ slug: 'chess-multi' });
    if (!game) {
      console.log('Không tìm thấy game chess-multi');
      process.exit(1);
    }

    const cats = Array.isArray(game.category) ? game.category : [];
    if (!cats.includes('Multiplayer')) {
      cats.push('Multiplayer');
      game.category = cats;
      await game.save();
      console.log('Đã thêm category "Multiplayer" vào game chess-multi');
    } else {
      console.log('Game chess-multi đã có category "Multiplayer"');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

addMultiplayerCategory();
