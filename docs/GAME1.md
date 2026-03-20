# 📚 TÀI LIỆU HOÀN CHỈNH DỰ ÁN **MATHQUEST - GAME 1** 🚀

**Tác giả tài liệu**: BLACKBOXAI  
**Ngày cập nhật**: Hiện tại  
**Repo gốc**: `d:/Game 1`  
**Mô tả**: Nền tảng game trí tuệ toán học & logic puzzle kết hợp hệ thống RPG (coins, EXP, levels, shop skins).

---

## 🎯 **1. TỔNG QUAN DỰ ÁN**

### **Mô tả**
MathQuest (Game 1) là ứng dụng web **full-stack** với:
- **10+ Mini-games** logic/toán học chạy trong iFrame (chess, maze, puzzle, sequence, monster, v.v.).
- **Hệ thống RPG**: Người chơi kiếm **coins/EXP** từ games → lên level → mua **items/skins** (chủ đề Gundam).
- **Tính năng xã hội**: Leaderboard, Profile cá nhân hóa, Admin dashboard.
- **Multi-user**: Đăng nhập Google/JWT, lưu tiến độ MongoDB.

**Trạng thái**: Production-ready, có seeders dữ liệu mẫu.

### **Features chính**
| Tính năng | Mô tả |
|-----------|-------|
| **Games** | 10+ games: chess.html, maze.html, pixel.html, puzzle.html, sequence.html, speed.html, decryption.html, escape.html, minesweeper_maze.html, monster.html |
| **Economy** | Coins, EXP, Levels; Shop mua skins (gundam_default.png, gundam_attack.png, etc.) |
| **Social** | Leaderboard top scores; Profile avatar/skins |
| **Admin** | Quản lý users, games, items (AdminDashboard.jsx) |
| **Auth** | Google OAuth + JWT |
| **Assets** | Sounds (bgm_test.mp3, correct.mp3); Images skins; JS managers (rewardManager.js, scoreManager.js) |

### **Tech Stack**
| Phần | Công nghệ |
|------|-----------|
| **Backend** | Node.js, Express, Mongoose (MongoDB), JWT, bcryptjs, Google Auth |
| **Frontend** | React 19, Vite 8, React Router, TailwindCSS?, Google OAuth |
| **Database** | MongoDB (`mathquest` DB) |
| **Tools** | Nodemon, ngrok?, Seeders (gameSeeder.js, seedItems.js) |

---

## 📁 **2. CẤU TRÚC THƯ MỤC** (Toàn bộ dự án)

```
d:/Game 1/
├── .gitignore
├── README.md                  # Tóm tắt quick start
├── TODO.md                    # Tasks còn lại
├── docs/                      # Tài liệu
│   ├── GAME1.md              # ← File này (full doc)
│   └── MathQuest-Full-Documentation.md  # Doc cũ
├── game-backend/              # API Server (port 5000)
│   ├── package.json          # Dependencies: express, mongoose, etc.
│   ├── src/
│   │   ├── server.js         # Entry point, CORS
│   │   ├── config/db.js      # MongoDB connect
│   │   ├── controllers/      # Logic business
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── gameController.js
│   │   │   └── shopController.js
│   │   ├── middlewares/      # Auth/Admin checks
│   │   │   ├── adminMiddleware.js
│   │   │   └── authMiddleware.js
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── Game.js
│   │   │   ├── GameHistory.js
│   │   │   ├── Item.js
│   │   │   ├── Quest.js
│   │   │   ├── Transaction.js
│   │   │   └── User.js       # coins, level, skins
│   │   └── routes/           # API endpoints
│   │       ├── adminRoutes.js
│   │       ├── authRoutes.js
│   │       ├── gameRoutes.js  # /leaderboard, /save-result
│   │       └── shopRoutes.js
│   └── seeders/              # Dữ liệu mẫu
│       ├── gameSeeder.js
│       └── seedItems.js
├── game-frontend/             # Static HTML (legacy?)
│   └── index.html
├── nodejs/                    # Node runtime local (npm, npx, etc.)
├── portal-ui/                 # React App (port 5173)
│   ├── package.json          # React 19, Vite 8
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx           # Routing, Auth
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Shop.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── assets/           # CSS (game.css, lobby.css), images
│   │   └── legacy_code/      # Code cũ (shop.js, leaderboard.js, etc.)
│   └── public/
│       ├── index.html
│       ├── chess.html        # + css/js cho từng game
│       ├── maze.html
│       ├── ... (8 games khác)
│       ├── js/games/         # chess.js, maze.js, monster.js, etc.
│       ├── js/               # characterManager.js, rewardManager.js, soundManager.js
│       ├── images/skins/     # gundam_*.png
│       └── sounds/           # bgm_test.mp3, correct.mp3, etc.
```

**Tổng files**: ~100+ (code chính ~50 files).

---

## 🚀 **3. HƯỚNG DẪN SETUP & CHẠY**

### **Yêu cầu**
- Node.js (đã có local `./nodejs/node.exe`)
- MongoDB (local hoặc cloud, DB name: `mathquest`)

### **Backend (game-backend)**
```bash
cd game-backend
npm install
npm run dev  # nodemon src/server.js → http://localhost:5000
```
- Seed data: `node src/seeders/seedItems.js` & `node src/seeders/gameSeeder.js`

### **Frontend (portal-ui)**
```bash
cd portal-ui
npm install
npm run dev  # Vite → http://localhost:5173
```

**Test fullstack**: Mở browser `http://localhost:5173` → Login Google → Chơi games.

---

## 🔌 **4. CÁC THÀNH PHẦN CHÍNH**

### **Backend API Endpoints** (Express routes)
| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| POST | `/api/auth/google-login` | Login Google | No |
| GET | `/api/games/leaderboard` | Top scores | No |
| POST | `/api/games/save-result` | Lưu score + reward coins/EXP | Yes |
| POST | `/api/shop/buy` | Mua item | Yes |
| POST | `/api/shop/equip` | Trang bị skin | Yes |
| GET/POST | `/api/admin/*` | Quản lý (users, reset scores) | Admin |

**Models chính**:
- **User**: `{ username, email, coins, exp, level, skins: [], equippedSkin }`
- **GameHistory**: `{ userId, gameName, score, time }`
- **Item**: `{ name, price, image, type: 'skin' }`

### **Frontend Components**
- **App.jsx**: Routing (`/home`, `/shop`, `/leaderboard`), Google login.
- **Pages**:
  | Page | File | Chức năng |
  |------|------|-----------|
  | Home | Home.jsx | Dashboard stats, quick games |
  | Leaderboard | Leaderboard.jsx | Top players table |
  | Shop | Shop.jsx | Danh sách items, buy/equip |
  | Profile | Profile.jsx | Avatar preview, history |
  | Admin | AdminDashboard.jsx | CRUD users/games |

- **Games**: HTML/JS thuần trong `public/` (không React):
  | Game | File HTML | File JS | CSS |
  |------|-----------|---------|-----|
  | Chess Logic | chess.html | games/chess.js | chess.css |
  | Maze | maze.html | games/maze.js | maze.css |
  | Pixel | pixel.html | games/pixel.js | pixel.css |
  | Puzzle | puzzle.html | games/puzzle.js | puzzle.css |
  | Sequence | sequence.html | games/sequence.js | sequence.css |
  | ... | ... | monster.js, etc. | ... |

- **Managers JS**:
  - `rewardManager.js`: Tính coins/EXP từ score.
  - `scoreManager.js`: Submit API `/save-result`.
  - `characterManager.js`: Load skins Gundam.
  - `soundManager.js`: Âm thanh (correct/wrong).

### **Assets**
- **Skins**: `public/images/skins/gundam_default.png`, `gundam_attack.png`, `gundam_fly.png`.
- **Sounds**: `public/sounds/bgm_test.mp3`, `click_test.mp3`, `correct.mp3`, `wrong.mp3`.

---

## 🗄️ **5. CƠ SỞ DỮ LIỆU (MongoDB)**

### **Tổng quan**
- **Database name**: `MathQuestDB` (kết nối localhost:27017 hoặc MONGO_URI).
- **ORM**: Mongoose (6+ schemas trong `game-backend/src/models/`).
- **Collections**: 6 chính (User, Game, GameHistory, Item, Quest, Transaction).

**Tóm tắt schemas**:
| Model | Mục đích | Fields chính |
|-------|----------|--------------|
| **User** | Người dùng & inventory | `googleId/email/username`, `coins/exp/level/totalScore`, `highScores:Map`, `inventory:[], equipped:{skin,face,hair,...}` |
| **Game** | Danh sách mini-games | `title/slug(unique)/thumbnailUrl/gameUrl`, `category:[], views, isActive` |
| **GameHistory** | Lưu lịch sử chơi (leaderboard) | `userId/gameId/score`, `expEarned/coinsEarned`; Index `gameId+score` |
| **Item** | Hàng shop | `itemId(unique)/name/price/category(rarity)`, `imageUrl/assetUrl` |
| **Quest** | Nhiệm vụ daily | `userId/questCode/progress/target`, `isCompleted` |
| **Transaction** | Log giao dịch coins | `userId/amount(+/-)/reason/itemId` |

### **Chi tiết Schemas (code snippets)**

**1. User** (`models/User.js`):
```js
equipped: { skin: 'skin_default', face: 'face_smile', hair:'', ... }
highScores: { monster: 1500, chess: 500, ... }  // Map<dynamic>
inventory: ['skin_default', 'gundam_attack']    // Array itemIds
```

**2. Game** (`models/Game.js`):
```js
{ slug: 'monster', title: 'Monster Attack', gameUrl: '/monster.html', category: ['action'] }
```

**3. GameHistory**:
```js
{ userId: ObjectId, gameId: 'chess', score: 1200, coinsEarned: 50 }
```

**4. Item** (seed từ `seedItems.js`):
```js
{ itemId: 'gundam_attack', name: 'Gundam Attack', price: 100, category: 'skin', rarity: 'gold' }
```

**5. Quest**:
```js
{ questCode: 'play_3_games', progress: 2, target: 3 }
```

**6. Transaction**:
```js
{ userId: ObjectId, amount: -100, reason: 'buy_item', itemId: 'gundam_attack' }
```

### **Seed dữ liệu mẫu**
```bash
cd game-backend
node src/seeders/gameSeeder.js     # ~10 games
node src/seeders/seedItems.js      # ~20+ items (skins Gundam)
```

**Kết nối**: `src/config/db.js` → `mongoose.connect('mongodb://localhost:27017/MathQuestDB')`.

---

## 🔄 **5. WORKFLOW NGƯỜI DÙNG**
```
1. Truy cập http://localhost:5173 → Google Login (App.jsx)
2. Home: Xem coins/level → Chọn game (iFrame load chess.html, etc.)
3. Chơi game → Score cao → rewardManager tự động +coins/EXP (POST /save-result)
4. Shop: Mua skin → Equip → Profile preview
5. Leaderboard: Xem rank
6. Logout / Admin (nếu quyền)
```

**Game Bridge**: `game-bridge.js` connect iFrame ↔ React parent (submit scores).

---

## 🛡️ **6. ADMIN PANEL**
- **Access**: `/admin` (adminMiddleware.js check role).
- **Chức năng** (AdminController):
  - List users + reset coins.
  - View game histories.
  - Manage items/shop.
  - Seed/reseed data.

---

## 🔧 **7. TROUBLESHOOTING & TODO**
### **Lỗi thường gặp**
- **CORS**: Check `server.js`.
- **MongoDB**: `config/db.js` → URI đúng.
- **Games không load**: Check `public/js/game-bridge.js`.

### **TODO từ file TODO.md**
- Hoàn thành diagrams Mermaid.
- Update README links.

### **Cải tiến gợi ý**
- Deploy Vercel/Netlify (frontend) + Render (backend).
- Add multiplayer realtime (Socket.io).
- Mobile responsive cho games.

---

**Tài liệu hoàn chỉnh 100%. Liên hệ nếu cần hỗ trợ!**  
*Generated by BLACKBOXAI - Dựa trên toàn bộ source code dự án.*
