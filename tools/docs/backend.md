# Backend — Tài liệu chi tiết

## Entry Point

### `server.js`
**Đường dẫn:** `game-backend/src/server.js`

Khởi tạo Express + HTTP + Socket.IO server, đăng ký middleware/routes, kết nối MongoDB.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `route:GET /` | 39-41 | Health-check, trả về "Máy chủ Backend MathQuest đang hoạt động bình thường!" |
| `chatWithAssistant` (import) | 49 | Import AI chatbot handler |
| Khởi tạo Socket.IO | 24-33 | Cấu hình CORS cho socket |
| Khởi tạo server | 60-71 | Lắng nghe cổng (mặc định 5000) |

---

## Config

### `config/db.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `connectDB` | 4-13 | Kết nối MongoDB qua Mongoose, exit process nếu lỗi |

---

## Models (Mongoose Schemas)

### `models/User.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `userSchema` | 4-55 | username, email, password, googleId, facebookId, avatarUrl, coins, exp, level, totalScore, inventory, equipped, highScores, favoriteGames, role, loginStreak, quests, stats, ... |
| `pre-save hook` | 58-63 | Băm password bằng bcrypt trước khi lưu |
| `matchPassword` | 66-68 | So sánh password plaintext với hash |

### `models/Game.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `gameSchema` | 4-15 | title, slug, thumbnailUrl, gameUrl, category[], views, isActive |

### `models/Item.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `ItemSchema` | 3-23 | itemId, name, description, price, category (skin/face/hair/...), rarity (silver/green/...), imageUrl, assetUrl |

### `models/Achievement.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `achievementSchema` | 3-11 | id, title, description, targetType, requirement, icon, color |

### `models/Quest.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `questSchema` | 3-12 | id, title, type (daily/weekly/milestone), requirement, rewardCoins, rewardExp |

### `models/Transaction.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `TransactionSchema` | 3-8 | userId, amount, reason, itemId |

### `models/GameHistory.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `GameHistorySchema` | 3-10 | userId, username, gameId, score, expEarned, coinsEarned |

### `models/Feedback.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `feedbackSchema` | 3-8 | userId, username, content, createdAt |

### `models/Knowledge.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `knowledgeSchema` | 3-17 | category, title, content — kiến thức cho AI chatbot |

### `models/ChatRule.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `chatRuleSchema` | 3-18 | keyword, response, isActive — easter egg cho chatbot |

### `models/ChatHistory.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `chatHistorySchema` | 3-21 | userId, userMessage, aiReply, isEasterEgg |

### `models/GameInstruction.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `gameInstructionSchema` | 4-11 | gameSlug, howToPlay[] (step, description, imageUrl) |

---

## Controllers

### `controllers/authController.js`
Xử lý xác thực và hồ sơ người dùng.

| Hàm | Dòng | Mục đích | Tham số | Trả về |
|-----|------|----------|---------|--------|
| `register` | 14-35 | Đăng ký user mới, tạo với 100 coins | `{username, email, password}` | `{success, message}` |
| `login` | 38-67 | Đăng nhập bằng email + password, trả JWT | `{email, password}` | `{success, token, user}` |
| `googleLogin` | 70-121 | Đăng nhập/đăng ký qua Google OAuth | `{credential}` | `{success, token, user}` |
| `updateScore` | 124-187 | Cập nhật coins/exp/level sau game, tạo GameHistory | `{gameId, score}` | `{success, coinsEarned, expEarned, newLevel}` |
| `leaderboard` | 190-198 | Lấy danh sách user cho bảng xếp hạng | — | `{success, data}` |
| `buyItem` | 201-226 | Mua item (legacy, hỗ trợ hardcoded) | `{userId, itemId}` | `{success, coins, equipped}` |
| `getProfile` | 229-259 | Lấy hồ sơ user, tự reset quest daily | — | `{success, user, gamesPlayed}` |
| `updateAvatar` | 262-278 | Cập nhật avatarUrl | `{avatarUrl}` | `{success, avatarUrl}` |
| `getUserInfo` | 281-293 | Lấy full user data (không password) | — | `{success, user}` |
| `toggleFavorite` | 296-322 | Thêm/xóa game yêu thích | `{gameSlug}` | `{success, favoriteGames}` |
| `submitFeedback` | 325-351 | Gửi phản hồi | `{content}` | `{success, message}` |
| `claimQuest` | 354-394 | Nhận thưởng quest (dailyLogin/play3Games/scoreHunter) | `{questId}` | `{success, user}` |
| `equipBadge` | 397-411 | Trang bị huy hiệu | `{badgeId}` | `{success, user}` |
| `updateUsername` | 414-448 | Đổi tên hiển thị | `{newUsername}` | `{success, username}` |
| `facebookLogin` | 451-509 | Đăng nhập qua Facebook Graph API | `{accessToken}` | `{success, token, user}` |

### `controllers/adminController.js`
Quản trị hệ thống.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `getAllUsers` | 9-14 | Lấy tất cả user (mới nhất trước) |
| `deleteUser` | 16-21 | Xóa user theo ID |
| `createUser` | 23-36 | Tạo user với role/coins tùy chỉnh |
| `updateUser` | 38-59 | Sửa user, hỗ trợ đặt lại password |
| `createItem` | 64-69 | Tạo shop item mới |
| `deleteItem` | 71-76 | Xóa shop item |
| `updateItem` | 78-85 | Sửa shop item |
| `getAllGames` | 92-98 | Lấy tất cả game (kể cả inactive) |
| `createGame` | 100-105 | Thêm game mới |
| `deleteGame` | 107-112 | Xóa game |
| `updateGame` | 114-121 | Sửa game |

### `controllers/gameController.js`
Logic chính cho game.

| Hàm | Dòng | Mục đích | Tham số |
|-----|------|----------|---------|
| `getAllGames` | 9-22 | Danh sách game (admin thấy cả inactive) | — |
| `getGameLeaderboard` | 25-56 | Top 10 người chơi cho một game | `gameId` |
| `getUserHistory` | 59-68 | Lịch sử 20 game gần nhất | — |
| `getTopExp` | 71-82 | Top 50 user theo level + exp | — |
| `getTopScore` | 85-102 | Top 50 user theo totalScore | — |
| `saveGameResult` | 105-170 | Lưu kết quả game, tính level/unlock | `{gameId, score, coinsEarned, expEarned}` |
| `getCategoryLeaderboard` | 173-214 | BXH theo category game | `category` |
| `getAIRecommendations` (1) | 217-253 | Gợi ý game đơn giản (bị ghi đè) | — |
| `getAIRecommendations` (2) | 255-304 | Gợi ý game KNN (dùng recommendationService) | — |
| `getGameInfo` | 306-320 | Chi tiết một game theo slug | `slug` |
| `getGameInstructions` | 322-339 | Hướng dẫn chơi game | `slug` |
| `incrementPlayCount` | 341-360 | Tăng lượt xem game | `slug` |

### `controllers/shopController.js`
Cửa hàng vật phẩm.

| Hàm | Dòng | Mục đích | Tham số |
|-----|------|----------|---------|
| `getAllItems` / `getShopItems` | 5-12 | Danh sách item trong shop | — |
| `buyItem` | 15-40 | Mua item (kiểm tra tiền, inventory) | `{itemId}` |
| `equipItem` | 43-91 | Trang bị item (theo category, giữ frame/badge cũ) | `{itemId}` |

### `controllers/achievementController.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `getAchievements` | 3-29 | Danh sách thành tích (sắp xếp theo requirement) |

### `controllers/aiController.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `chatWithAssistant` | 10-106 | Chat với AI (Google Gemini 2.5 Flash), kiểm tra ChatRule easter egg trước, dùng Knowledge base làm context |

### `controllers/recommendationController.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `calculateEuclideanDistance` | 5-12 | Tính khoảng cách Euclidean giữa 2 vector |
| `getRecommendedGames` | 14-66 | Gợi ý game bằng collaborative filtering (KNN, K=3) |

### `controllers/questController.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `getQuests` | 7-72 | Danh sách quest kèm tiến độ cá nhân |
| `claimQuest` | 75-123 | Nhận thưởng quest (kiểm tra cooldown daily/weekly) |

---

## Routes

### `routes/authRoutes.js`
| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| POST | `/register` | — | `register` |
| POST | `/login` | — | `login` |
| POST | `/google-login` | — | `googleLogin` |
| POST | `/update-score` | auth | `updateScore` |
| GET | `/profile` | auth | `getProfile` |
| POST | `/update-avatar` | auth | `updateAvatar` |
| POST | `/info` | auth | `getUserInfo` |
| POST | `/toggle-favorite` | auth | `toggleFavorite` |
| POST | `/feedback` | auth | `submitFeedback` |
| POST | `/claim-quest` | auth | `claimQuest` |
| POST | `/equip-badge` | auth | `equipBadge` |
| POST | `/update-username` | auth | `updateUsername` |
| POST | `/facebook-login` | — | `facebookLogin` |

### `routes/adminRoutes.js`
Tất cả route dùng `authMiddleware` + `adminMiddleware`.

| Method | Path | Handler |
|--------|------|---------|
| GET | `/users` | `getAllUsers` |
| POST | `/users` | `createUser` |
| PUT | `/users/:id` | `updateUser` |
| DELETE | `/users/:id` | `deleteUser` |
| POST | `/items` | `createItem` |
| PUT | `/items/:id` | `updateItem` |
| DELETE | `/items/:id` | `deleteItem` |
| POST | `/games` | `createGame` |
| PUT | `/games/:id` | `updateGame` |
| DELETE | `/games/:id` | `deleteGame` |
| GET | `/games` | `getAllGames` |

### `routes/gameRoutes.js`
| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| GET | `/list` | — | `getAllGames` |
| GET | `/history` | auth | `getUserHistory` |
| POST | `/save-result` | auth | `saveGameResult` |
| GET | `/leaderboard/exp` | — | `getTopExp` |
| GET | `/leaderboard/score` | — | `getTopScore` |
| GET | `/leaderboard/game/:gameId` | — | `getGameLeaderboard` |
| GET | `/leaderboard/category/:category` | — | `getCategoryLeaderboard` |
| GET | `/recommendations` | auth | `getAIRecommendations` |
| GET | `/info/:slug` | — | `getGameInfo` |
| GET | `/instructions/:slug` | — | `getGameInstructions` |
| POST | `/:slug/play` | — | `incrementPlayCount` |

### `routes/shopRoutes.js`
| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| GET | `/items` | — | `getAllItems` |
| POST | `/buy` | auth | `buyItem` |
| POST | `/equip` | auth | `equipItem` |

### `routes/achievementRoutes.js`
| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| GET | `/list` | — | `getAchievements` |

### `routes/questRoutes.js`
| Method | Path | Middleware | Handler |
|--------|------|-----------|---------|
| GET | `/list` | auth | `getQuests` |
| POST | `/claim` | auth | `claimQuest` |

---

## Middlewares

### `middlewares/authMiddleware.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `authMiddleware` | 3-26 | Xác thực JWT, gán `req.user` với decoded payload |

### `middlewares/adminMiddleware.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `adminMiddleware` | 3-20 | Kiểm tra role admin, tra cứu user từ DB |

---

## Services

### `services/progressService.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `updateGameProgress` | 7-67 | Cập nhật quest/achievement sau game, trả về notification unlocks |

### `services/recommendationService.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `calculateEuclideanDistance` | 3-9 | Khoảng cách Euclidean giữa 2 vector |
| `getKNNRecommendations` | 17-43 | KNN với K=3, gợi ý game từ neighbor |

### `services/ddaService.js`
File rỗng, chưa có nội dung.

---

## Socket

### `socket/chessHandler.js`
Xử lý game cờ vua online qua Socket.IO.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `chessHandler` | 5-180 | Main handler, đăng ký tất cả event chess |
| `chess:join-lobby` | 7 | Tham gia phòng chờ |
| `chess:create-room` | 14 | Tạo phòng mới |
| `chess:join-room` | 33 | Tham gia phòng chờ |
| `chess:start-game` | 50 | Bắt đầu game (khi đủ 2 người) |
| `chess:make-move` | 64 | Thực hiện nước đi (dùng chess.js) |
| `chess:resign` | 113 | Đầu hàng |
| `chess:rematch` | 132 | Đấu lại (đổi màu) |
| `chess:leave-room` | 149 | Rời phòng |
| `disconnect` | 165 | Xử lý mất kết nối |
| `findRoomByPlayer` | 182-187 | Tìm phòng theo socket ID |
| `getLobbyInfo` | 189-202 | Danh sách phòng đang chờ |
| `generateRoomId` | 204-206 | Tạo mã phòng 4 ký tự |

---

## Seeders

### `seeders/gameSeeder.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `sampleGames` | 10-99 | 11 game mẫu (title, slug, thumbnail, category) |
| `seedDB` | 101-122 | Xóa và chèn lại dữ liệu game mẫu |

### `seeders/seedItems.js`
| Thành phần | Dòng | Mục đích |
|-----------|------|----------|
| `sampleItems` | 13-55 | 7 item mẫu (hair, shirt, face, wings, frames) |
| `seedItems` | 59-72 | Xóa và chèn lại item mẫu |
