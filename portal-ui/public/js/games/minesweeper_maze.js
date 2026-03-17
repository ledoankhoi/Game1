/* file: public/js/games/minesweeper_maze.js */

const MinesweeperMaze = {
    rows: 10,
    cols: 10,
    mineCount: 15,
    grid: [], 
    currentPos: { r: 0, c: 0 },
    startPos: { r: 0, c: 0 },
    endPos: { r: 9, c: 9 },
    timer: 0,
    timerInterval: null,
    isGameOver: false,
    steps: 0,
    shields: 3,
    
    currentScore: 0, // Hệ thống điểm nội bộ

    init: function() {
        console.log("Minesweeper Maze Protocol: Initializing v2...");
        this.resetGame();
        this.generateLevel();
        this.updateScanner(); 
        this.renderGrid();
        this.startTimer();
        this.bindEvents();
        this.updateUI();
    },

    resetGame: function() {
        const lv = parseInt(localStorage.getItem('minesweeper_maze_level') || 0);
        this.rows = 10 + Math.floor(lv / 2);
        this.cols = 10 + Math.floor(lv / 2);
        this.mineCount = Math.floor((this.rows * this.cols) * 0.15) + (lv * 2);
        
        this.endPos = { r: this.rows - 1, c: this.cols - 1 };
        this.currentPos = { ...this.startPos };
        this.grid = [];
        this.isGameOver = false;
        this.timer = 0;
        this.steps = 0;
        this.shields = 3;
        this.currentScore = 0;

        if (this.timerInterval) clearInterval(this.timerInterval);
        
        const gridEl = document.getElementById('minesweeper-grid');
        if (gridEl) gridEl.classList.remove('shake-effect');
        
        const statusEl = document.getElementById('status-label');
        if (statusEl) {
            statusEl.innerText = "ĐANG HOẠT ĐỘNG";
            statusEl.classList.remove('text-accent-red', 'text-accent-green');
            statusEl.classList.add('text-primary');
        }
    },

    generateLevel: function() {
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = {
                    type: 'wall', isMine: false, count: 0, revealed: false, 
                    flagged: false, sensed: false, mineDetected: false, r: r, c: c
                };
            }
        }

        const stack = [this.startPos];
        const visited = new Set();
        visited.add(`0,0`);

        while (stack.length > 0) {
            const curr = stack[stack.length - 1];
            this.grid[curr.r][curr.c].type = 'path';

            const neighbors = this.getCardinals(curr.r, curr.c).filter(n => !visited.has(`${n.r},${n.c}`));
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                visited.add(`${next.r},${next.c}`);
                stack.push(next);
            } else {
                stack.pop();
            }
        }

        this.grid[this.endPos.r][this.endPos.c].type = 'path';

        const goldenPath = this.findPath(this.startPos, this.endPos);
        const goldenSet = new Set(goldenPath.map(p => `${p.r},${p.c}`));

        let minesPlaced = 0, attempts = 0;
        while (minesPlaced < this.mineCount && attempts < 2000) {
            attempts++;
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            
            if (this.grid[r][c].type === 'path' && !goldenSet.has(`${r},${c}`) && !this.grid[r][c].isMine) {
                if (Math.abs(r - this.startPos.r) + Math.abs(c - this.startPos.c) > 1) {
                    this.grid[r][c].isMine = true;
                    minesPlaced++;
                }
            }
        }

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c].isMine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                            if (this.grid[nr][nc].isMine) count++;
                        }
                    }
                }
                this.grid[r][c].count = count;
            }
        }

        this.grid[this.startPos.r][this.startPos.c].revealed = true;
    },

    getCardinals: function(r, c) {
        const res = [];
        if (r > 0) res.push({ r: r - 1, c: c });
        if (r < this.rows - 1) res.push({ r: r + 1, c: c });
        if (c > 0) res.push({ r: r, c: c - 1 });
        if (c < this.cols - 1) res.push({ r: r, c: c + 1 });
        return res;
    },

    findPath: function(start, end) {
        const queue = [[start]];
        const visited = new Set();
        visited.add(`${start.r},${start.c}`);

        while (queue.length > 0) {
            const path = queue.shift();
            const curr = path[path.length - 1];

            if (curr.r === end.r && curr.c === end.c) return path;

            for (const n of this.getCardinals(curr.r, curr.c)) {
                if (!visited.has(`${n.r},${n.c}`) && this.grid[n.r][n.c].type === 'path') {
                    visited.add(`${n.r},${n.c}`);
                    queue.push([...path, n]);
                }
            }
        }
        return [start, end];
    },

    updateScanner: function() {
        const r = this.currentPos.r;
        const c = this.currentPos.c;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    this.grid[nr][nc].sensed = true;
                }
            }
        }
    },

    renderGrid: function() {
        const container = document.getElementById('minesweeper-grid');
        if (!container) return;
        container.innerHTML = '';
        
        // Dynamic grid sizing based on level
        const cellSize = this.cols > 15 ? '35px' : '45px';
        container.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize})`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cellData = this.grid[r][c];
                const cellEl = document.createElement('div');
                cellEl.className = 'cell flex items-center justify-center font-bold font-mono text-lg rounded-sm cursor-pointer transition-all';
                cellEl.style.width = cellSize;
                cellEl.style.height = cellSize;
                
                if (cellData.type === 'wall' && !cellData.sensed) {
                    cellEl.classList.add('bg-slate-800/80');
                } else if (cellData.type === 'wall') {
                    cellEl.classList.add('bg-slate-700', 'border', 'border-slate-600');
                } else {
                    if (!cellData.sensed && !cellData.revealed) {
                        cellEl.classList.add('bg-slate-800/80');
                    } else {
                        if (r === this.startPos.r && c === this.startPos.c) cellEl.classList.add('bg-primary/20');
                        if (r === this.endPos.r && c === this.endPos.c) cellEl.classList.add('bg-green-500/20');
                        
                        if (cellData.revealed) {
                            cellEl.classList.add('bg-slate-900', 'border', 'border-white/5');
                        } else if (cellData.sensed) {
                            cellEl.classList.add('bg-slate-800', 'hover:bg-slate-700');
                        }

                        if (cellData.mineDetected) {
                            cellEl.classList.add('bg-red-500/40', 'border-red-500');
                        } else if (cellData.revealed || cellData.sensed) {
                            if (cellData.isMine && cellData.revealed) {
                                cellEl.classList.add('bg-red-600');
                                cellEl.innerHTML = '<span class="material-symbols-outlined text-white">explosion</span>';
                            } else if (!cellData.isMine && cellData.count > 0) {
                                cellEl.innerText = cellData.count;
                                // Number colors
                                const colors = ['text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400'];
                                cellEl.classList.add(colors[(cellData.count - 1) % colors.length]);
                            }
                        }

                        if (cellData.flagged && !cellData.revealed) {
                            cellEl.innerHTML = '<span class="material-symbols-outlined text-accent-yellow">flag</span>';
                        }
                    }
                }

                if (r === this.currentPos.r && c === this.currentPos.c) {
                    cellEl.classList.add('border-2', 'border-primary', 'bg-primary/10');
                    cellEl.innerHTML = '<span class="material-symbols-outlined text-primary animate-bounce">person</span>';
                }

                cellEl.onclick = () => this.handleCellClick(r, c);
                cellEl.oncontextmenu = (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(r, c);
                };

                container.appendChild(cellEl);
            }
        }
    },

    handleCellClick: function(r, c) {
        if (this.isGameOver) return;
        
        const cell = this.grid[r][c];
        if (cell.type === 'wall' || cell.flagged) return;

        const dist = Math.abs(this.currentPos.r - r) + Math.abs(this.currentPos.c - c);
        
        // CHỈ CHO PHÉP ĐI TỪNG BƯỚC MỘT
        if (dist === 1) {
            this.steps++;
            
            if (cell.isMine && !cell.mineDetected) {
                // ĐẠP TRÚNG MÌN
                this.shields--;
                cell.mineDetected = true;
                cell.revealed = true;
                
                const gridEl = document.getElementById('minesweeper-grid');
                if(gridEl) {
                    gridEl.classList.add('shake-effect');
                    setTimeout(() => gridEl.classList.remove('shake-effect'), 500);
                }
                
                if (this.shields <= 0) {
                    this.gameOver(false); // CHẾT CHẮC
                } else {
                    this.updateUI();
                    this.renderGrid();
                }
            } else if (!cell.isMine) {
                // ĐI AN TOÀN
                if (!cell.revealed) {
                    this.currentScore += 20; // +20 điểm cho mỗi ô mới mở
                }
                
                this.currentPos = { r, c };
                cell.revealed = true;
                this.updateScanner();
                this.renderGrid();
                this.updateUI();
                
                if (r === this.endPos.r && c === this.endPos.c) {
                    this.gameOver(true); // THẮNG
                }
            }
        }
    },

    handleCellRightClick: function(r, c) {
        if (this.isGameOver) return;
        const cell = this.grid[r][c];
        if (cell.revealed || cell.type === 'wall' || !cell.sensed) return;

        cell.flagged = !cell.flagged;
        this.renderGrid();
    },

    startTimer: function() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            const timerEl = document.getElementById('timer-seconds');
            if (timerEl) timerEl.innerText = this.timer;
            
            const circle = document.getElementById('timer-circle');
            if (circle) {
                const offset = (this.timer % 60) / 60 * 276;
                circle.style.strokeDashoffset = 276 - offset;
            }
        }, 1000);
    },

    updateUI: function() {
        const stepsEl = document.getElementById('steps-count');
        if (stepsEl) stepsEl.innerText = this.steps;
        
        const coordsEl = document.getElementById('coords-display');
        if (coordsEl) coordsEl.innerText = `[${this.currentPos.r},${this.currentPos.c}]`;

        const scoreEl = document.getElementById('live-score');
        if (scoreEl) scoreEl.innerText = this.currentScore.toLocaleString();
        
        const shieldContainer = document.getElementById('shield-container');
        if (shieldContainer) {
            shieldContainer.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                const shield = document.createElement('span');
                shield.className = `material-symbols-outlined ${i < this.shields ? 'text-accent-red animate-pulse' : 'text-slate-600'}`;
                shield.innerText = 'shield';
                shieldContainer.appendChild(shield);
            }
        }

        const lv = parseInt(localStorage.getItem('minesweeper_maze_level') || 0);
        const diffText = document.getElementById('difficulty-text');
        if (diffText) diffText.innerText = lv < 3 ? "Cơ bản" : (lv < 7 ? "Nâng cao" : "Nguy hiểm");
        const diffBar = document.getElementById('difficulty-bar');
        if (diffBar) diffBar.style.width = `${Math.min(100, 20 + lv * 10)}%`;
    },

    // ==========================================
    // XỬ LÝ KẾT THÚC GAME VỚI OVERLAY MỚI
    // ==========================================
    gameOver: async function(isWin) {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        
        const lv = parseInt(localStorage.getItem('minesweeper_maze_level') || 0);

        if (isWin) {
            // --- XỬ LÝ THẮNG ---
            const timeBonus = Math.max(0, 1000 - (this.timer * 5));
            const shieldBonus = this.shields * 500;
            const finalScore = this.currentScore + timeBonus + shieldBonus + (lv * 200);

            document.getElementById('vic-total-score').innerText = finalScore.toLocaleString();

            // Lưu điểm lên server
            if (typeof RewardManager !== 'undefined') {
                await RewardManager.submitScore('minesweeper', finalScore);
            }

            // Bật Overlay Thắng
            const overlay = document.getElementById('ms-victory-overlay');
            if(overlay) {
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    overlay.children[0].classList.remove('scale-95');
                    overlay.children[0].classList.add('scale-100');
                }, 50);
            }

            // Tăng level
            localStorage.setItem('minesweeper_maze_level', lv + 1);

        } else {
            // --- XỬ LÝ THUA (ĐẠP MÌN) ---
            document.getElementById('minesweeper-grid').classList.add('shake-effect');
            
            // Lật tung tất cả mìn
            this.grid.flat().forEach(c => {
                if (c.isMine) { c.revealed = true; c.sensed = true; }
            });
            this.renderGrid();

            // Lưu phần điểm đi đường vớt vát lại
            if (typeof RewardManager !== 'undefined') {
                const reward = await RewardManager.submitScore('minesweeper', this.currentScore);
                if (reward) {
                    document.getElementById('go-reward-container').classList.remove('hidden');
                    document.getElementById('go-earned-coins').innerText = '+' + reward.coins;
                    document.getElementById('go-earned-exp').innerText = '+' + reward.exp;
                }
            }

            // Bơm data vào màn hình
            document.getElementById('go-level-display').innerText = `Level ${lv + 1}`;
            document.getElementById('go-score-display').innerText = this.currentScore;

            // Bật Overlay BOOM
            const overlay = document.getElementById('ms-gameover-overlay');
            const panel = document.getElementById('ms-gameover-panel');
            if(overlay && panel) {
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    panel.classList.remove('scale-95');
                    panel.classList.add('scale-100');
                }, 50);
            }

            // Reset Level về 0
            localStorage.setItem('minesweeper_maze_level', 0);
        }
    },

    bindEvents: function() {
        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) btnRestart.onclick = () => {
            if(confirm("Khởi tạo lại trận địa sẽ mất toàn bộ tiến trình hiện tại. Trừ 1 Giáp. Chấp nhận?")) {
                this.shields--;
                if(this.shields <= 0) this.gameOver(false);
                else {
                    this.updateUI();
                    location.reload();
                }
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => MinesweeperMaze.init());