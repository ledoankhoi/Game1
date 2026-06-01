# Game Engine — Tài liệu chi tiết

Tất cả game được viết bằng JavaScript thuần, chạy trong `<iframe>` trên frontend.

---

## Managers (Hỗ trợ game)

### `scoreManager.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `saveScoreToDatabase(gameId, score)` | 2-44 | Lưu điểm số qua `POST /api/auth/update-score`, cập nhật coins/level trong localStorage |

### `characterData.js`
| Export | Dòng | Mục đích |
|--------|------|----------|
| `CharacterData.skins` | 2-18 | Định nghĩa skin: `default`, `ninja`, `robot` (name, image path, dialog) |

### `characterManager.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `CharacterManager.init()` | 7-24 | Khởi tạo character từ localStorage skin |
| `CharacterManager.createCharacterElement()` | 27-56 | Tạo div character cố định với sprite + speech bubble |
| `CharacterManager.updateAppearance()` | 59-66 | Áp CSS filter cho sprite |
| `CharacterManager.poke()` | 69-94 | Click: bounce animation, đổi pose, hiện bubble |
| `CharacterManager.refresh()` | 97-100 | Load lại skin từ localStorage |

### `game-bridge.js`
Cầu nối giữa game HTML và backend.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `MathQuestBridge.showRewardPopup(message, newCoins)` | 6-46 | Popup cyberpunk hiển thị phần thưởng |
| `MathQuestBridge.saveScore(score, gameType)` | 49-100 | Lưu điểm và hiển thị popup thưởng |
| `MathQuestBridge.showItemRewardPopup(itemName, amount, icon, message)` | 105-170 | Popup fancy cho item/coin rewards |

### `game-header.js`
Header động cho iframe game.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `injectResources()` | 5-19 | Inject Google Fonts, Material Symbols |
| `detectGameColor()` | 36-50 | Phát hiện màu chính của game từ CSS |
| `handleGlobalLogout()` | 170-176 | Xóa localStorage và redirect |
| DOM `click` (help-btn) | 126-160 | Fetch hướng dẫn game từ API |
| DOM `click` (close-modal-btn) | 162-164 | Đóng modal hướng dẫn |

### `soundManager.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `SoundManager.init()` | 12-30 | Khởi tạo BGM loop, lắng nghe settingsChange |
| `SoundManager.play(name)` | 32-38 | Phát âm thanh (nếu không mute) |
| `SoundManager.toggleMusic()` | 41-49 | Bật/tắt BGM |
| `SoundManager.toggleMute()` | 51-62 | Bật/tắt mute toàn bộ |

### `rewardManager.js`
| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `RewardManager.getExpNeededForLevel(level)` | 11-13 | Tính EXP cần cho level (công thức: `1000 * 1.5^(level-1)`) |
| `RewardManager.processGameEnd(gameId, score, gameLog)` | 21-66 | Gửi kết quả game, hiển thị màn hình game-over thống nhất |
| `RewardManager.showUnifiedGameOver(score, coins, exp, leveledUp, ...)` | 71-153 | Màn hình game-over 2 cột: battle log + score summary |
| `RewardManager.submitScore(gameId, score)` | 155-187 | Gửi điểm nhẹ, trả về coins/exp/level |

---

## Games

### `games/race.js` — Math Racing
Game đua xe giải toán.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `updateCarPosition()` | 52-54 | Cập nhật vị trí xe theo lane |
| `generateMathProblem()` | 56-99 | Tạo bài toán cộng/trừ/nhân theo điểm |
| `createShatterParticles()` | 101-131 | Hiệu ứng vỡ kính |
| `gameLoop(timestamp)` | 133-186 | Loop chính: update speed, gates, collision |
| `checkCollision()` | 188-222 | Phát hiện đúng/sai lane |
| `handleGameOver()` | 224-282 | Kết thúc game, lưu điểm |
| `resetGame()` | 284-314 | Reset toàn bộ state |

### `games/sequence.js` — Sequence
Game dãy số.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `initGame()` | 19-56 | Khởi tạo game, bind events |
| `LevelGenerator.generateArithmetic(level)` | 61-66 | Dãy số cộng |
| `LevelGenerator.generateGeometric(level)` | 67-72 | Dãy số nhân |
| `LevelGenerator.generateFibonacci(level)` | 73-82 | Fibonacci / Tribonacci |
| `LevelGenerator.generateInterleaved(level)` | 83-87 | Hai dãy xen kẽ |
| `LevelGenerator.generateDigitalSum(level)` | 88-93 | Dãy `n^2 + n` |
| `generateNewLevel()` | 94-106 | Chọn generator theo level |
| `renderGame(data)` | 108-142 | Render các ô số |
| `checkAnswer()` | 144-207 | Kiểm tra đáp án |
| `showHint()` | 209-218 | Gợi ý (-50 điểm) |
| `animateValue(id, start, end, duration)` | 237-247 | Animation số đếm |

### `games/escape.js` — Escape
Game chiến thuật 2 người trên lưới.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `initGame()` | 34-41 | Khởi tạo bàn cờ 11x12 |
| `createBoard()` | 43-48 | Tạo lưới với obstacle |
| `renderBoard()` | 50-97 | Render toàn bộ board |
| `calculateMoves(sr, sc)` | 99-121 | Tính nước đi hợp lệ (4 hướng trượt) |
| `onCellClick(r, c)` | 123-157 | Xử lý click: spawn/move/select |
| `doSpawn(r, c)` | 159-173 | Đặt quân mới lên bàn |
| `doMove(m)` | 175-204 | Di chuyển, kiểm tra thoát |
| `endTurn()` | 206-212 | Đổi lượt, restart timer |
| `startTimer()` | 214-229 | Countdown 30s |
| `endGame()` | 288-297 | Kết thúc game |

### `games/minesweeper_maze.js` — Minesweeper Maze
Kết hợp Minesweeper + Maze.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `MinesweeperMaze.init()` | 20-29 | Reset, tạo level, render |
| `MinesweeperMaze.resetGame()` | 31-57 | Reset state theo level |
| `MinesweeperMaze.generateLevel()` | 59-125 | DFS maze generation, đặt mìn |
| `MinesweeperMaze.findPath(start, end)` | 136-155 | BFS tìm đường ngắn nhất |
| `MinesweeperMaze.updateScanner()` | 157-169 | Quét 3x3 quanh vị trí |
| `MinesweeperMaze.renderGrid()` | 171-238 | Render maze grid |
| `MinesweeperMaze.handleCellClick(r, c)` | 241-288 | Di chuyển 1 bước |
| `MinesweeperMaze.startTimer()` | 299-311 | Timer 1 giây |
| `MinesweeperMaze.gameOver(isWin)` | 344-418 | Kết thúc, tính điểm |

### `games/speed.js` — Speed Math
Game tính nhẩm tốc độ.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `SpeedGame.init()` | 16-44 | Khởi tạo, bind answer buttons |
| `SpeedGame.generateLevel()` | 46-87 | Tạo câu hỏi theo độ khó |
| `SpeedGame.generateAnswers(correct)` | 89-104 | Tạo 6 đáp án |
| `SpeedGame.startTimer()` | 106-120 | Timer với decay |
| `SpeedGame.checkAnswer(val)` | 152-168 | Kiểm tra đáp án |
| `SpeedGame.gameOver(reason)` | 175-235 | Kết thúc, lưu điểm |

### `games/decryption.js` — Decryption (Simon Says)
Game trí nhớ ánh sáng.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `DecryptionGame.init()` | 15-22 | Render grid, bind start |
| `DecryptionGame.renderGrid()` | 24-37 | Tạo 9 ô tín hiệu |
| `DecryptionGame.startGame()` | 39-46 | Reset, bắt đầu round |
| `DecryptionGame.nextRound()` | 48-68 | CPU phát lại sequence |
| `DecryptionGame.handleInput(id)` | 70-90 | Kiểm tra input người chơi |
| `DecryptionGame.activateCell(id)` | 92-102 | Highlight ô + phát âm thanh |
| `DecryptionGame.playTone(id)` | 104-117 | Phát tone với AudioContext |
| `DecryptionGame.gameOver()` | 119-156 | Kết thúc, lưu điểm |

### `games/monsterExtension.js` — Monster Extension
UI kết thúc game cho Monster Game.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `MonsterExtension.showGameOver(score, historyLog)` | 21-43 | Hiển thị màn hình kết thúc |
| `MonsterExtension.calculateRank(score)` | 50-70 | Xếp hạng S/A/B/C |
| `MonsterExtension.renderHistory(history)` | 72-118 | Render battle log |

### `games/pixel.js` — Pixel Mix
Game pha màu pixel.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `PixelGame.init()` | 24-41 | Reset, tạo level |
| `PixelGame.generateLevel()` | 95-120 | Tạo 3 key layers + 6 noise grids |
| `PixelGame.checkWin()` | 122-147 | Kiểm tra kết quả |
| `PixelGame.gameOver(reason)` | 149-179 | Kết thúc, lưu điểm |
| `PixelGame.calculateMix(g1, g2, g3)` | 201-214 | Pha 3 lớp màu |
| `PixelGame.renderSource()` | 225-256 | Render 9 source grids |
| `PixelGame.toggleSelection(index)` | 257-268 | Chọn/bỏ chọn grid (max 3) |
| `PixelGame.rotateGrid(idx, dir)` | 269-275 | Xoay grid 90° |
| `PixelGame.updateResultPreview()` | 286-323 | Preview kết quả pha màu |

### `games/chess.js` — Chess (Knight's Tour)
Game mã đi tuần 8x8.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `initGame()` | 26-33 | Khởi tạo board |
| `generateHiddenSolution()` | 35-57 | Tạo magic square 8x8 |
| `generateLevel()` | 58-97 | Tạo knight's tour (Warnsdorff) |
| `getKnightMoves(r, c)` | 99-102 | Nước đi hợp lệ của mã |
| `renderBoard()` | 103-152 | Render bàn cờ |
| `updateUI()` | 154-189 | Tính tổng hàng/cột |
| `handleCellClick(r, c)` | 191-198 | Mở overlay nhập số |
| `executeMove(r, c, val)` | 229-260 | Ghi nhận nước đi |
| `checkWinCondition()` | 301-315 | Kiểm tra chiến thắng |
| `endGame(isWin)` | 326-438 | Kết thúc, tính điểm |

### `games/rubik.js` — Rubik
Rubik 3D (Three.js).

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `highlightFace(axisWorld, size)` | 73-81 | Highlight mặt được chọn |
| `resetMapping()` | 84-90 | Reset axis mapping |
| `createCube(size)` | 93-127 | Tạo khối Rubik NxNxN |
| `updateLogicalMapping(f)` | 226-247 | Tính toán axis từ camera |
| `rotateLayer(faceKey, axisWorld, ...)` | 250-302 | Animation xoay layer |
| `logMove(moveStr)` | 306-316 | Ghi log nước đi |
| `executeNext()` | 360-368 | Thực thi move tiếp theo (scramble) |
| `animate()` | 377-381 | Render loop |

### `games/hex.js` — Hex
Game cờ Hex với AI MCTS.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `initGame()` | 16-36 | Tạo board 7x7 |
| `updateCellUI(r, c, player)` | 38-48 | Update ô sau khi đánh |
| `handlePlayerMove(r, c)` | 51-72 | Xử lý nước đi người chơi |
| `makeAIMove()` | 74-93 | AI đánh (MCTS) |
| `checkWin(gridState, player)` | 95-118 | DFS kiểm tra thắng |
| `runMCTS(rootBoard, aiPlayer, maxTimeMs)` | 121-153 | Monte Carlo Tree Search (600ms) |
| `simulateRandomGame(simBoard, ...)` | 155-167 | Random playout |
| `endGame(winner)` | 185-197 | Kết thúc game |

### `games/monster.js` — Monster Math
Game bắn quái vật giải toán.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `MonsterGame.start()` | 30-94 | Khởi tạo game, wave 1 |
| `MonsterGame.checkAndFire(inputValue)` | 96-134 | Bắn khi nhập đúng đáp án |
| `MonsterGame.fireProjectile(target)` | 136-188 | Animation đạn plasma |
| `MonsterGame.hitEnemy(target)` | 190-228 | Trúng quái, giảm HP |
| `MonsterGame.setupWave(waveLevel)` | 230-240 | Cấu hình wave |
| `MonsterGame.gameLoop(currentTime)` | 256-276 | Main loop |
| `MonsterGame.spawnMonster()` | 278-288 | Sinh quái |
| `MonsterGame.createEnemy(type)` | 290-359 | Tạo quái với câu hỏi toán |
| `MonsterGame.updateMonsters()` | 369-389 | Di chuyển quái xuống |
| `MonsterGame.damagePlayer(amount)` | 420-429 | Trừ máu người chơi |
| `MonsterGame.createExplosion(target, isBig)` | 441-464 | Hiệu ứng nổ |
| `MonsterGame.saveProgress()` | 471-506 | Lưu điểm lên server |
| `MonsterGame.victory()` | 510-530 | Chiến thắng |
| `MonsterGame.gameOver()` | 532-550 | Thua cuộc |

### `games/puzzle.js` — 2048 Puzzle
Game 2048 cổ điển.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `initGame()` | 18-36 | Khởi tạo grid 4x4 |
| `addRandomTile()` | 56-67 | Thêm ô 2 (90%) hoặc 4 (10%) |
| `renderGrid()` | 69-91 | Render grid với CSS class |
| `slide(row)` | 193-197 | Trượt ô sang trái |
| `combine(row)` | 198-207 | Gộp ô cùng giá trị |
| `moveLeft/Right/Up/Down()` | 208-259 | Di chuyển 4 hướng |
| `checkWin()` | 261-269 | Kiểm tra 2048 |
| `isGameOver()` | 271-280 | Kiểm tra hết nước đi |
| `triggerGameOver()` | 296-325 | Kết thúc, lưu điểm |
| `triggerVictory()` | 327-335 | Chiến thắng (+2000 bonus) |

### `games/maze.js` — Memory Maze
Game maze trí nhớ.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `MazeGame.init()` | 30-41 | Khởi tạo maze |
| `MazeGame.resetGame()` | 43-74 | Reset state theo level |
| `MazeGame.generateWalls()` | 111-124 | Tạo tường ngẫu nhiên (35%) |
| `MazeGame.renderProjections()` | 132-165 | Render 3 projection grids (đỏ/vàng/xanh) |
| `MazeGame.renderMainGrid()` | 167-184 | Render maze chính |
| `MazeGame.startTimer()` | 195-219 | Timer cho mỗi phase |
| `MazeGame.switchToActionPhase()` | 221-254 | Chuyển sang phase hành động |
| `MazeGame.handleCellMove(targetIdx)` | 256-305 | Di chuyển, kiểm tra tường |
| `MazeGame.victory()` | 327-345 | Chiến thắng |
| `MazeGame.gameOver(msg)` | 347-414 | Thua cuộc |

### `games/memory.js` — Memory Card
Game lật thẻ nhớ.

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `initGame()` | 23-42 | Khởi tạo deck, shuffle, render |
| `buildDeck()` | 44-50 | Tạo 16 thẻ (8 cặp) |
| `shuffleArray(arr)` | 52-57 | Fisher-Yates shuffle |
| `onCardClick(index)` | 80-108 | Lật thẻ |
| `handleMatch()` | 110-133 | Ghép cặp thành công |
| `handleMismatch()` | 135-151 | Ghép cặp sai (lật lại sau 800ms) |
| `triggerGameOver()` | 217-245 | Kết thúc, lưu điểm |

### `games/chess-multi.js` — Chess Multiplayer
Cờ vua online (Socket.IO).

| Hàm | Dòng | Mục đích |
|-----|------|----------|
| `setupSocketListeners()` | 33-131 | Tất cả socket event handlers |
| `createRoom()` | 133-137 | Tạo phòng |
| `joinRoom()` | 139-145 | Tham gia phòng |
| `leaveRoom()` | 147-152 | Rời phòng |
| `renderRoomList(rooms)` | 154-173 | Danh sách phòng lobby |
| `renderBoard()` | 197-256 | Render bàn cờ 8x8 |
| `onSquareClick(sq)` | 258-280 | Click ô cờ |
| `updateTurnDisplay()` | 282-292 | Hiển thị lượt |
