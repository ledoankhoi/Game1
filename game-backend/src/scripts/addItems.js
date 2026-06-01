require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mathquest', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log(' Connected to DB'))
  .catch(err => { console.error(' DB error:', err); process.exit(1); });

const newItems = [
  // === MŨ (HAT) ===
  {
    itemId: 'hat_cowboy',
    name: 'Mũ Cao Bồi',
    description: 'Phong cách miền Tây hoang dã',
    price: 200,
    category: 'hair',
    rarity: 'green',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hat_cowboy',
    assetUrl: ''
  },
  {
    itemId: 'hat_crown',
    name: 'Vương Miện',
    description: 'Dành cho nhà vua bất tử',
    price: 500,
    category: 'hair',
    rarity: 'gold',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hat_crown',
    assetUrl: ''
  },
  {
    itemId: 'hat_wizard',
    name: 'Mũ Phù Thủy',
    description: 'Chứa đầy ma thuật bí ẩn',
    price: 300,
    category: 'hair',
    rarity: 'purple',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hat_wizard',
    assetUrl: ''
  },
  {
    itemId: 'hat_beanie',
    name: 'Mũ Len',
    description: 'Ấm áp và dễ thương',
    price: 150,
    category: 'hair',
    rarity: 'blue',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hat_beanie',
    assetUrl: ''
  },

  // === TÓC (HAIR) ===
  {
    itemId: 'hair_long',
    name: 'Tóc Dài Mượt',
    description: 'Suôn mượt như thác đổ',
    price: 150,
    category: 'hair',
    rarity: 'blue',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hair_long',
    assetUrl: ''
  },
  {
    itemId: 'hair_curly',
    name: 'Tóc Xoăn Bồng',
    description: 'Cá tính và nổi bật',
    price: 200,
    category: 'hair',
    rarity: 'purple',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hair_curly',
    assetUrl: ''
  },
  {
    itemId: 'hair_mohawk',
    name: 'Tóc Mohawk',
    description: 'Chất chơi không sợ mưa rơi',
    price: 250,
    category: 'hair',
    rarity: 'green',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hair_mohawk',
    assetUrl: ''
  },
  {
    itemId: 'hair_pomp',
    name: 'Tóc Bồi Bồi',
    description: 'Lịch lãm, sang trọng',
    price: 180,
    category: 'hair',
    rarity: 'silver',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hair_pomp',
    assetUrl: ''
  }
];

const run = async () => {
  try {
    let added = 0;
    for (const item of newItems) {
      const exists = await Item.findOne({ itemId: item.itemId });
      if (!exists) {
        await Item.create(item);
        added++;
        console.log(`  + ${item.itemId} (${item.name})`);
      } else {
        console.log(`  ~ ${item.itemId} already exists, skipped`);
      }
    }
    console.log(`\nDone! Added ${added} new items.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
