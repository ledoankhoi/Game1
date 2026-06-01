# Frontend React — Tài liệu chi tiết

## Entry Point

### `main.jsx`
**Đường dẫn:** `game-frontend/src/main.jsx`

Render React app vào DOM với `BrowserRouter` và `GoogleOAuthProvider`.

---

## Root Component

### `App.jsx`
**Đường dẫn:** `game-frontend/src/App.jsx`

Component gốc, quản lý auth state toàn cục, routing, layout (Header/Footer/Chatbot), hiển thị modal Login/Register.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `App` | 19-118 | Root component |
| `loadUser` | 31-38 | Load user từ localStorage khi mount |
| `handleLogout` | 50-57 | Xóa localStorage và chuyển về `/` |

**State:** `searchQuery`, `showAuth`, `isLoginMode`, `user`

**Routes:**
- `/` → Home
- `/about` → About
- `/leaderboard` → Leaderboard
- `/shop` → Shop
- `/profile` → Profile
- `/admin` → AdminDashboard
- `/user/:id` → UserProfile

---

## Components

### `components/Header.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `Header` | 4-134 | Thanh navigation: logo, search, nav links, user info (avatar/frame/badge/coins), login/signup buttons |
| `getFrameStyleApp` | 16-21 | Map frameId → Tailwind border/shadow classes |
| `getBadgeIconApp` | 23-31 | Map badgeId → icon name + color class |

**Props:** `searchQuery`, `setSearchQuery`, `user`, `handleLogout`, `setShowAuth`, `setIsLoginMode`

### `components/Footer.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `Footer` | 5-55 | Footer với contact links, About, help links |

### `components/Banner3D.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `Banner3D` | 15-68 | 3D interactive Spline banner với navigation dots/arrows |

**Props:** `onColorChange`

### `components/Chatbot.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `Chatbot` | 3-145 | Floating chatbot widget, gọi AI backend |
| `scrollToBottom` | 13-15 | Auto-scroll xuống message mới |
| `playBotSound` | 22-27 | Phát âm thanh khi bot trả lời |
| `sendMessage` | 29-73 | Gửi message → POST `/api/ai/chat` |

**API:** `POST http://localhost:5000/api/ai/chat`

### `components/MarbleRun.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `MarbleRun` | 4-118 | Mô phỏng vật lý Matter.js (marbles rơi qua tường) |
| `buildWalls` | 24-57 | Quét DOM tìm `.marble-wall` và tạo body tĩnh |
| `dropMarble` | 63-85 | Thả marble ngẫu nhiên, tối đa 40 body |

### `components/SettingsMenu.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `SettingsMenu` | 43-182 | Panel cài đặt: wallpaper, âm thanh, ngôn ngữ |

**Props:** `pageBgImage`, `setPageBgImage`

### `components/Auth/Login.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `Login` | 9-163 | Modal đăng nhập với email/password, Google, Facebook | — |
| `handleStandardLogin` | 16-43 | Đăng nhập email/password | `POST /api/auth/login` |
| `handleGoogleSuccess` | 46-67 | Google OAuth login | `POST /api/auth/google-login` |
| `handleFacebookResponse` | 70-87 | Facebook login | `POST /api/auth/facebook-login` |
| `handleBoxClick` | 89 | Stop event propagation | — |

**Props:** `onClose`, `onSwitchToRegister`

### `components/Auth/Register.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `Register` | 3-81 | Modal đăng ký với username/email/password | — |
| `handleRegister` | 10-32 | Gửi đăng ký | `POST /api/auth/register` |
| `handleBoxClick` | 34 | Stop event propagation | — |

**Props:** `onClose`, `onSwitchToLogin`

---

## Pages

### `pages/Home.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `Home` | 5-237 | Trang chủ: sidebar categories, game grid, favorites, search |
| `handlePlayGame` | 14-28 | Tăng lượt chơi, chuyển hướng đến game | `POST /api/game/{slug}/play` |
| `handleToggleFavorite` | 83-106 | Thêm/xóa yêu thích | `POST /api/auth/toggle-favorite` |

**State:** `games`, `categories`, `activeCategory`, `favoriteGames`, `pageBgImage`
**API calls:** `GET /api/game/list`, `GET /api/auth/profile`, `GET /api/game/recommendations`

### `pages/About.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `About` | 186-450 | Trang giới thiệu: hero, motivation, bento grid, particle canvas, stats, CTA |
| `MagneticButton` | 6-26 | Button với hiệu ứng từ tính theo chuột |
| `GlowCard` | 29-53 | Card với hiệu ứng glow-tilt |
| `Particle` (class) | 80-113 | Lớp particle cho canvas |
| `InteractiveCanvas` | 56-156 | Canvas particles tương tác chuột |
| `NumberCounter` | 159-183 | Counter animation khi scroll vào view |

### `pages/Leaderboard.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `Leaderboard` | 6-254 | BXH với 3 tab (EXP, Score, Per-Game), filter category |
| `getRankStyle` | 114-119 | CSS class theo thứ hạng |

**API calls:** `GET /api/game/list`, `GET /api/game/leaderboard/exp`, `GET /api/game/leaderboard/score`, `GET /api/game/leaderboard/game/{slug}`, `GET /api/game/leaderboard/category/{cat}`

### `pages/Shop.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `Shop` | 3-300 | Cửa hàng: item grid, filter category/rarity, search, buy/equip |
| `syncUserData` | 16-35 | Đồng bộ user data | `GET /api/auth/profile` |
| `fetchShopItems` | 37-44 | Lấy danh sách item | `GET /api/shop/items` |
| `handleBuy` | 46-77 | Mua item | `POST /api/shop/buy` |
| `handleEquip` | 79-99 | Trang bị item | `POST /api/shop/equip` |
| `getActualRarity` | 101-112 | Suy ra rarity từ giá |
| `getRarityStyle` | 114-124 | CSS class theo rarity |
| `removeAccents` | 150-157 | Xóa dấu tiếng Việt cho search |

**Props:** `searchQuery`

### `pages/AdminDashboard.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `AdminDashboard` | 4-482 | Panel admin: CRUD Users/Items/Games |
| `fetchData` | 30-48 | Fetch dữ liệu theo tab | `GET /api/admin/*` |
| `handleDelete` | 50-69 | Xóa record | `DELETE /api/admin/*` |
| `handleEdit` | 71-76 | Mở modal chỉnh sửa |
| `handleInputChange` | 78-80 | Cập nhật form |
| `handleFileUpload` | 82-101 | Upload file ảnh (max 10MB) |
| `handleSubmit` | 103-151 | Tạo/sửa record | `POST/PUT /api/admin/*` |
| `openModal` | 153-164 | Mở modal tạo mới |
| `renderRarityBadge` | 166-176 | Badge hiển thị rarity |

### `pages/UserProfile.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `UserProfile` | 3-191 | Trang profile standalone (phiên bản cũ) |
| `fetchShopItems` | 23-33 | Lấy item shop | `GET /api/shop/items` |
| `handleFileUpload` | 39-51 | Upload avatar (max 2MB) |
| `handleSaveAvatar` | 53-94 | Lưu avatar | `POST /api/shop/equip` |

---

## Profile (pages/Profile/)

### `Profile/Profile.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `Profile` | 21-404 | Trang profile chính: avatar, stats, tabs, quest |
| `getFrameStyle` | 14-19 | CSS cho frame |
| `handleLogout` | 70-74 | Đăng xuất |
| `handleSaveAvatar` | 76-95 | Lưu avatar | `POST /api/auth/update-avatar` |
| `handleSaveName` | 97-130 | Đổi tên | `POST /api/auth/update-username` |
| `handleFileUpload` | 132-139 | Upload file ảnh |
| `toggleFavorite` | 141-153 | Yêu thích game | `POST /api/auth/toggle-favorite` |
| `handleClaimQuest` | 155-199 | Nhận thưởng quest | `POST /api/quest/claim`, `GET /api/quest/list` |
| `handleEquipBadge` | 201-216 | Trang bị huy hiệu | `POST /api/auth/equip-badge` |
| `getQuestProgress` | 235-238 | Tiến độ quest |
| `getAchievementProgress` | 240-249 | Tiến độ thành tích |
| `renderBadgeIcon` | 251-256 | Icon huy hiệu |

**State:** `profileData`, `gamesPlayed`, `gamesList`, `history`, `favoriteGames`, `questsList`, `achievementsList`, `activeTab`
**Tabs:** Overview, Achievements, Quests, Favorites, History, Feedback

### `Profile/TabOverview.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `TabOverview` | 6-72 | Tổng quan: high scores, level progress, badges |

**Props:** `gamesList`, `highScores`, `currentLevel`, `achievementsList`, `getAchievementProgress`

### `Profile/TabAchievements.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `TabAchievements` | 3-54 | Grid thành tích: icon, title, progress bar, equip/unequip |

### `Profile/TabQuests.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `TabQuests` | 3-70 | Nhiệm vụ: grouped by type (daily/weekly/milestone) |
| `renderQuestButton` | 8-12 | Button "Nhận Thưởng" / "Đã Xong" / "Chưa Đạt" |
| `renderQuestSection` | 14-52 | Section quest với progress bar |

### `Profile/TabHistory.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `TabHistory` | 5-52 | Lịch sử chơi: game, score, coins, exp, timestamp |

### `Profile/TabFavorites.jsx`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `TabFavorites` | 6-36 | Grid game yêu thích với unfavorite button |

### `Profile/TabFeedback.jsx`
| Hàm | Dòng | Mục đích | API |
|-----|------|----------|-----|
| `TabFeedback` | 4-74 | Form gửi phản hồi |
| `handleFeedbackSubmit` | 10-36 | Gửi feedback | `POST /api/auth/feedback` |
