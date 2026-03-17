/* file: public/js/games/maze.js */

const MazeGame = {
    size: 5,
    memoTime: 60,   
    actionTime: 60, 
    currentTime: 60,
    timerInterval: null,
    phase: 'MEMO',  

    currentScore: 0,
    history: [], // MỚI: Mảng lưu trữ nhật ký di chuyển

    hWalls: [], 
    vWalls: [],
    
    layers: {
        red: { h: [], v: [] },
        yellow: { h: [], v: [] },
        blue: { h: [], v: [] }
    },

    startIdx: 0,
    endIdx: 24,
    currentPos: 0,
    pathTaken: [0],

    init: function() {
        console.log("Maze Protocol: Initialized.");
        this.resetGame();
        this.generateWalls();
        this.renderProjections(); 
        this.renderMainGrid();
        this.bindEvents();
        
        const sidebar = document.getElementById('projection-sidebar');
        if(sidebar) sidebar.style.display = 'flex'; 

        this.startTimer(); 
    },

    resetGame: function() {
        this.phase = 'MEMO';
        this.currentTime = this.memoTime; 
        this.hWalls = []; this.vWalls = [];
        this.layers = { red: {h:[], v:[]}, yellow: {h:[], v:[]}, blue: {h:[], v:[]} };
        this.currentPos = 0;
        this.pathTaken = [0];
        this.history = []; // Xóa log cũ
        
        this.currentScore = 0;
        this.updateLiveScore();
        
        const inGameLog = document.getElementById('in-game-log');
        if (inGameLog) inGameLog.innerHTML = '<div class="text-[10px] text-slate-500 italic text-center mt-4">Waiting for movement...</div>';

        const lv = parseInt(localStorage.getItem('maze_level') || 0);
        this.size = 5 + Math.floor(lv / 3); 
        this.endIdx = (this.size * this.size) - 1;
        
        const btnStart = document.getElementById('btn-start');
        if (btnStart) {
            btnStart.innerText = "BẮT ĐẦU CHẠY";
            btnStart.disabled = false;
            btnStart.classList.remove('opacity-50');
        }
        
        const phaseLabel = document.getElementById('phase-label');
        if (phaseLabel) {
            phaseLabel.innerText = "Memorization Phase";
            phaseLabel.className = "text-xs font-bold tracking-[0.4em] uppercase text-primary mb-4 block animate-pulse";
        }
    },

    updateLiveScore: function() {
        const sidebarScore = document.getElementById('maze-live-score');
        if (sidebarScore) sidebarScore.innerText = this.currentScore.toLocaleString();
        
        const headerScore = document.getElementById('current-score');
        if (headerScore) headerScore.innerText = this.currentScore.toLocaleString();
    },

    // 🌟 HÀM MỚI: GHI NHẬN VÀ HIỂN THỊ LOG TRỰC TIẾP
    logAction: function(message, isSuccess, scoreAdded = 0) {
        this.history.push({ msg: message, success: isSuccess, score: scoreAdded });
        
        const container = document.getElementById('in-game-log');
        if (!container) return;
        
        // Xóa dòng waiting ban đầu
        if (this.history.length === 1) container.innerHTML = '';

        const colorClass = isSuccess ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-red-400 border-red-500/50 bg-red-500/10';
        const icon = isSuccess ? 'check_circle' : 'warning';
        const scoreHTML = scoreAdded > 0 ? `<span class="text-[9px] text-yellow-500 font-black">+${scoreAdded} pts</span>` : '';

        const html = `
            <div class="flex items-center justify-between p-2 rounded border-l-2 ${colorClass} text-[10px] animate-fade-in">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[14px]">${icon}</span>
                    <span class="font-mono">${message}</span>
                </div>
                ${scoreHTML}
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', html); // Đẩy lên đầu
    },

    generateWalls: function() {
        for (let i = 0; i < (this.size - 1) * this.size; i++) {
            if (Math.random() < 0.35) {
                this.hWalls.push(i);
                this.assignLayer(i, 'h');
            }
        }
        for (let i = 0; i < this.size * (this.size - 1); i++) {
            if (Math.random() < 0.35) {
                this.vWalls.push(i);
                this.assignLayer(i, 'v');
            }
        }
    },

    assignLayer: function(idx, type) {
        const rand = Math.random();
        const target = rand < 0.33 ? 'red' : (rand < 0.66 ? 'yellow' : 'blue');
        this.layers[target][type].push(idx);
    },

    renderProjections: function() {
        ['red', 'yellow', 'blue'].forEach(color => {
            const container = document.getElementById(`grid-${color}`);
            if (!container) return;
            container.innerHTML = '';
            container.style.gridTemplateColumns = `repeat(${this.size}, minmax(0, 1fr))`;

            for (let i = 0; i < this.size * this.size; i++) {
                const cell = document.createElement('div');
                cell.className = "aspect-square relative bg-white/5 border border-white/5";
                
                const r = Math.floor(i / this.size);
                const c = i % this.size;

                if (c < this.size - 1) {
                    const vIdx = r * (this.size - 1) + c;
                    if (this.layers[color].v.includes(vIdx)) {
                        const wall = document.createElement('div');
                        wall.className = `absolute right-[-1px] top-0 bottom-0 w-[3px] z-10 bg-accent-${color}`;
                        cell.appendChild(wall);
                    }
                }
                if (r < this.size - 1) {
                    const hIdx = r * this.size + c;
                    if (this.layers[color].h.includes(hIdx)) {
                        const wall = document.createElement('div');
                        wall.className = `absolute bottom-[-1px] left-0 right-0 h-[3px] z-10 bg-accent-${color}`;
                        cell.appendChild(wall);
                    }
                }
                container.appendChild(cell);
            }
        });
    },

    renderMainGrid: function() {
        const container = document.getElementById('main-maze-grid');
        if (!container) return;
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.size}, minmax(0, 1fr))`;

        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = `maze-cell relative flex items-center justify-center rounded-sm bg-slate-800/40 border border-white/5 aspect-square transition-all duration-200 ${this.phase === 'ACTION' ? 'cursor-pointer hover:bg-primary/20' : 'cursor-not-allowed opacity-50'}`;
            
            if (i === this.startIdx) cell.innerHTML = '<span class="material-symbols-outlined text-accent-blue text-2xl">person</span>';
            if (i === this.endIdx) cell.innerHTML = '<span class="material-symbols-outlined text-accent-blue text-2xl">door_open</span>';

            cell.onclick = () => this.handleCellMove(i);
            container.appendChild(cell);
        }
        this.updatePlayerUI();
    },

    bindEvents: function() {
        const btnStart = document.getElementById('btn-start');
        if (btnStart) {
            btnStart.onclick = () => {
                if (this.phase === 'MEMO') this.switchToActionPhase();
            };
        }
    },

    startTimer: function() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        const timerSeconds = document.getElementById('timer-seconds');
        const timerCircle = document.getElementById('timer-circle');
        const maxDuration = this.phase === 'MEMO' ? this.memoTime : this.actionTime;

        this.timerInterval = setInterval(() => {
            this.currentTime--;
            if (timerSeconds) timerSeconds.innerText = this.currentTime;
            if (timerCircle) {
                const offset = 276 - (this.currentTime / maxDuration) * 276;
                timerCircle.style.strokeDashoffset = offset;
            }
            if (this.currentTime <= 0) {
                clearInterval(this.timerInterval); 
                if (this.phase === 'MEMO') {
                    this.switchToActionPhase();
                } else {
                    this.logAction("TIMEOUT ERROR", false);
                    this.gameOver("Hết thời gian!");
                }
            }
        }, 1000);
    },

    switchToActionPhase: function() {
        clearInterval(this.timerInterval); 
        this.phase = 'ACTION';
        this.currentTime = this.actionTime; 
        
        const timerSeconds = document.getElementById('timer-seconds');
        if (timerSeconds) timerSeconds.innerText = this.currentTime;

        const phaseLabel = document.getElementById('phase-label');
        if (phaseLabel) {
            phaseLabel.innerText = "Escape Phase";
            phaseLabel.className = "text-xs font-bold tracking-[0.4em] uppercase text-red-500 mb-4 block animate-pulse";
        }

        const sidebar = document.getElementById('projection-sidebar');
        if(sidebar) sidebar.style.display = 'none';

        const btnStart = document.getElementById('btn-start');
        if(btnStart) {
            btnStart.innerText = "ĐANG THOÁT HIỂM...";
            btnStart.disabled = true;
            btnStart.classList.add('opacity-50', 'bg-red-500');
        }

        const badge = document.getElementById('status-badge');
        if(badge) {
            badge.innerText = "UNLOCKED";
            badge.className = "px-2 py-1 bg-green-500/20 rounded text-[9px] font-bold text-green-400 animate-pulse";
        }

        this.logAction("Protocol Unlocked. Escape started.", true);
        this.renderMainGrid();
        this.startTimer();
    },

    handleCellMove: function(targetIdx) {
        if (this.phase !== 'ACTION') return;

        const curR = Math.floor(this.currentPos / this.size);
        const curC = this.currentPos % this.size;
        const tarR = Math.floor(targetIdx / this.size);
        const tarC = targetIdx % this.size;

        const isAdjacent = (Math.abs(curR - tarR) + Math.abs(curC - tarC)) === 1;
        if (!isAdjacent) return;

        // CẤM ĐI LÙI
        if (this.pathTaken.includes(targetIdx)) {
            const grid = document.getElementById('main-maze-grid');
            if (grid && grid.children[targetIdx]) {
                const cell = grid.children[targetIdx];
                cell.classList.add('border-red-500', 'shake-effect', 'bg-red-500/30');
                setTimeout(() => cell.classList.remove('border-red-500', 'shake-effect', 'bg-red-500/30'), 400);
            }
            this.logAction(`Blocked: Node ${targetIdx} already visited.`, false);
            return; 
        }

        // KIỂM TRA TƯỜNG
        let hasWall = false;
        if (curR === tarR) { 
            const vIdx = curR * (this.size - 1) + Math.min(curC, tarC);
            if (this.vWalls.includes(vIdx)) hasWall = true;
        } else { 
            const hIdx = Math.min(curR, tarR) * this.size + curC;
            if (this.hWalls.includes(hIdx)) hasWall = true;
        }

        if (hasWall) {
            this.logAction(`FATAL: Collision at Node ${targetIdx}`, false);
            this.gameOver("Structural Collision Detected");
            return;
        }

        // ĐI ĐÚNG -> +10 ĐIỂM & LOG
        this.currentScore += 10; 
        this.updateLiveScore();
        this.logAction(`Path clear: Node ${targetIdx}`, true, 10);

        this.currentPos = targetIdx;
        this.pathTaken.push(targetIdx);
        this.updatePlayerUI();

        if (targetIdx === this.endIdx) this.victory();
    },

    updatePlayerUI: function() {
        const cells = document.querySelectorAll('.maze-cell');
        cells.forEach((cell, idx) => {
            cell.classList.remove('bg-primary/20', 'border-primary');
            if (idx === this.endIdx) {
                cell.innerHTML = '<span class="material-symbols-outlined text-accent-blue text-3xl">door_open</span>';
            } else {
                cell.innerHTML = ''; 
            }
            
            if (this.pathTaken.includes(idx)) {
                cell.classList.add('bg-primary/10');
            }
            if (idx === this.currentPos) {
                cell.innerHTML = '<span class="material-symbols-outlined text-primary text-3xl animate-pulse">person</span>';
                cell.classList.add('border-primary', 'bg-primary/20');
            }
        });
    },

    victory: async function() {
        clearInterval(this.timerInterval); 
        this.logAction("DESTINATION REACHED!", true);
        
        const completionBonus = 1000 + (this.size * 100) + (this.currentTime * 10); 
        const finalTotalScore = this.currentScore + completionBonus;
        
        const container = document.getElementById('maze-container');
        if(container) container.style.boxShadow = '0 0 50px #25f46a';

        if (typeof RewardManager !== 'undefined' && typeof RewardManager.submitScore === 'function') {
            await RewardManager.submitScore('maze', finalTotalScore);
        }

        const currentLv = parseInt(localStorage.getItem('maze_level') || 0);
        localStorage.setItem('maze_level', currentLv + 1);
        
        setTimeout(() => location.reload(), 800);
    },

    gameOver: async function(msg) {
        clearInterval(this.timerInterval); 
        
        const container = document.getElementById('maze-container');
        if(container) container.classList.add('shake-effect');
        
        // 1. GỬI ĐIỂM (Chỉ tính điểm đi đường, không có bonus hoàn thành)
        if (typeof RewardManager !== 'undefined' && typeof RewardManager.submitScore === 'function') {
            const reward = await RewardManager.submitScore('maze', this.currentScore);
            if (reward) {
                document.getElementById('go-score').innerText = this.currentScore.toLocaleString();
                document.getElementById('go-coins').innerText = '+' + reward.coins;
                document.getElementById('go-exp').innerText = '+' + reward.exp;
            }
        }

        // 2. Cập nhật Text
        const currentLv = parseInt(localStorage.getItem('maze_level') || 0) + 1;
        const levelDisplay = document.getElementById('go-level-display');
        const errorMsg = document.getElementById('maze-error-msg');
        if(levelDisplay) levelDisplay.innerText = `Level ${currentLv}`;
        if(errorMsg) errorMsg.innerText = msg;

        // 3. CLONE MÊ CUNG VÀO MINI-MAP
        const mainGrid = document.getElementById('main-maze-grid');
        const miniMap = document.getElementById('go-minimap');
        if (mainGrid && miniMap) {
            miniMap.innerHTML = mainGrid.innerHTML; // Copy toàn bộ HTML bên trong
            miniMap.style.gridTemplateColumns = `repeat(${this.size}, minmax(0, 1fr))`;
            
            // Xóa hết class hover và kích thước lớn trên các ô clone để vừa mini-map
            Array.from(miniMap.children).forEach(cell => {
                cell.classList.remove('hover:bg-primary/20', 'cursor-pointer');
                cell.classList.add('text-[10px]'); // Chữ/Icon nhỏ lại
            });
        }

        // 4. RENDER LOG RA GAMEOVER
        const logContainer = document.getElementById('go-log-container');
        if (logContainer) {
            logContainer.innerHTML = '';
            this.history.forEach((item, index) => {
                const color = item.success ? 'text-green-400' : 'text-red-400 font-bold';
                logContainer.innerHTML += `
                    <div class="flex items-center justify-between border-b border-white/5 pb-1">
                        <span class="text-[9px] text-gray-500 uppercase">SEQ_${index}</span>
                        <span class="text-[10px] font-mono ${color}">${item.msg}</span>
                    </div>
                `;
            });
        }

        // 5. TRƯỢT GIAO DIỆN LÊN
        const overlay = document.getElementById('maze-gameover-overlay');
        const panel = document.getElementById('maze-gameover-panel');
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
        localStorage.setItem('maze_level', 0);
    }
};

document.addEventListener('DOMContentLoaded', () => MazeGame.init());