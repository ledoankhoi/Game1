require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');

const DB_URI = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/mathquest';

const gamesData = [
  {
    title: 'Galaxy Striker',
    slug: 'monster',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600',
    gameUrl: '/monster.html',
    category: ['Math'],
  },
  {
    title: 'Pattern Finder',
    slug: 'sequence',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620207418302-439b387441b0?q=80&w=600',
    gameUrl: '/sequence.html',
    category: ['Logic'],
  },
  {
    title: 'Speed Math',
    slug: 'speed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600',
    gameUrl: '/speed.html',
    category: ['Speed'],
  },
  {
    title: 'Maze Protocol 01',
    slug: 'maze',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600',
    gameUrl: '/maze.html',
    category: ['Memory'],
  },
  {
    title: 'Minesweeper Maze',
    slug: 'minesweeper_maze',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600',
    gameUrl: '/minesweeper_maze.html',
    category: ['Logic'],
  },
  {
    title: 'Chiến Thuật Thoát Hiểm',
    slug: 'escape',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616499370260-485b3e5ed653?q=80&w=600',
    gameUrl: '/escape.html',
    category: ['Elite'],
  },
  {
    title: 'Rattan March',
    slug: 'chess',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=600',
    gameUrl: '/chess.html',
    category: ['Logic'],
  },
  {
    title: 'Chess Multiplayer',
    slug: 'chess-multi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=600',
    gameUrl: '/chess-multi.html',
    category: ['Multiplayer', 'Logic'],
  },
  {
    title: 'Signal Decryption',
    slug: 'puzzle',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600',
    gameUrl: '/puzzle.html',
    category: ['Memory'],
  },
  {
    title: 'Pixel Painting 3',
    slug: 'pixel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600',
    gameUrl: '/pixel.html',
    category: ['Elite'],
  },
  {
    title: 'Memory Card',
    slug: 'memory',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600',
    gameUrl: '/memory.html',
    category: ['Memory'],
  },
  {
    title: 'Othello Multiplayer',
    slug: 'othello-multi',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529693451587-5a5c5e0a2f3a?w=400',
    gameUrl: '/othello-multi.html',
    category: ['Multiplayer', 'Logic'],
  },
  {
    title: 'Decryption',
    slug: 'decryption',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?q=80&w=600',
    gameUrl: '/decryption.html',
    category: ['Logic', 'Elite'],
  },
  {
    title: 'Hex',
    slug: 'hex',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579165466741-7f35e4755661?q=80&w=600',
    gameUrl: '/hex.html',
    category: ['Logic'],
  },
  {
    title: 'Racing Math',
    slug: 'race',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600',
    gameUrl: '/race.html',
    category: ['Speed'],
  },
  {
    title: 'Rubik',
    slug: 'rubik',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b741?q=80&w=600',
    gameUrl: '/rubik.html',
    category: ['Puzzle', 'Logic'],
  },
];

const hasPlaceholderImage = (url) => {
  if (!url) return true;
  if (url.includes('placehold.co') || url.includes('placeholder')) return true;
  if (url.includes('via.placeholder.com')) return true;
  return false;
};

async function seed() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Đã kết nối MongoDB');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const game of gamesData) {
      const existing = await Game.findOne({ slug: game.slug });

      if (!existing) {
        await Game.create(game);
        console.log(`  + ${game.slug} (${game.title})`);
        created++;
      } else if (hasPlaceholderImage(existing.thumbnailUrl)) {
        await Game.updateOne({ _id: existing._id }, { $set: { thumbnailUrl: game.thumbnailUrl } });
        console.log(`  ~ ${game.slug}: updated thumbnail`);
        updated++;
      } else {
        console.log(`  . ${game.slug}: already has thumbnail, skipped`);
        skipped++;
      }
    }

    console.log(`\nDone! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

seed();
