/* file: public/js/games/maze.js - Luật chơi: Vách ngăn tàng hình */

const MazeGame = {
    size: 5,
    memoTime: 60,
    currentTime: 60,
    timerInterval: null,
    phase: 'MEMO',

    // Cấu trúc dữ liệu mới cho vách ngăn
    // Tường ngang: (size-1) hàng * size cột
    // Tường dọc: size hàng * (size-1) cột
    hWalls: [], 
    vWalls: [],
    
    // Phân loại màu cho vách ngăn
    layers: {
        red: { h: [], v: [] },
        yellow: { h: [], v: [] },
        blue: { h: [], v: [] }
    },

    startIdx: 0,
    endIdx: 24, // size*size - 1
    currentPos: 0,
    pathTaken: [0],

    init: function() {
        console.log("Maze Protocol: Wall-based logic activated.");
        this.resetGame();
        this.generateWalls();
        this.renderProjections();
        this.renderMainGrid();
        this.startTimer();
        this.bindEvents();
        setTimeout(() => this.updateHeaderUI(), 500);
    },

    resetGame: function() {
        this.phase = 'MEMO';
        this.currentTime = this.memoTime;
        this.hWalls = []; this.vWalls = [];
        this.layers = { red: {h:[], v:[]}, yellow: {h:[], v:[]}, blue: {h:[], v:[]} };
        this.currentPos = 0;
        this.pathTaken = [0];

        const lv = parseInt(localStorage.getItem('maze_level') || 0);
        this.size = 5 + Math.floor(lv / 3); 
        this.endIdx = (this.size * this.size) - 1;
    },

    generateWalls: function() {
        // Sinh tường ngang ngẫu nhiên
        for (let i = 0; i < (this.size - 1) * this.size; i++) {
            if (Math.random() < 0.35) {
                this.hWalls.push(i);
                this.assignLayer(i, 'h');
            }
        }
        // Sinh tường dọc ngẫu nhiên
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

    // Vẽ 3 bảng chiếu (Chỉ hiện vách ngăn màu)
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

                // Vẽ vách ngăn bên phải (Dọc)
                if (c < this.size - 1) {
                    const vIdx = r * (this.size - 1) + c;
                    if (this.layers[color].v.includes(vIdx)) {
                        const wall = document.createElement('div');
                        wall.className = `absolute right-[-1px] top-0 bottom-0 w-[3px] z-10 bg-accent-${color}`;
                        cell.appendChild(wall);
                    }
                }
                // Vẽ vách ngăn bên dưới (Ngang)
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
            cell.className = "maze-cell relative flex items-center justify-center rounded-sm bg-slate-800/40 border border-white/5 cursor-pointer hover:bg-primary/5 transition-all aspect-square";
            
            if (i === this.startIdx) cell.innerHTML = '<span class="material-symbols-outlined text-accent-blue text-2xl">person</span>';
            if (i === this.endIdx) cell.innerHTML = '<span class="material-symbols-outlined text-accent-blue text-2xl">door_open</span>';

            cell.onclick = () => this.handleCellMove(i);
            container.appendChild(cell);
        }
        this.updatePlayerUI();
    },

    handleCellMove: function(targetIdx) {
        if (this.phase !== 'ACTION') return;

        const curR = Math.floor(this.currentPos / this.size);
        const curC = this.currentPos % this.size;
        const tarR = Math.floor(targetIdx / this.size);
        const tarC = targetIdx % this.size;

        // Chỉ cho phép di chuyển sang ô cạnh bên (không đi chéo)
        const isAdjacent = (Math.abs(curR - tarR) + Math.abs(curC - tarC)) === 1;
        if (!isAdjacent) return;

        // KIỂM TRA TƯỜNG (Logic quan trọng nhất)
        let hasWall = false;
        if (curR === tarR) { // Di chuyển ngang
            const vIdx = curR * (this.size - 1) + Math.min(curC, tarC);
            if (this.vWalls.includes(vIdx)) hasWall = true;
        } else { // Di chuyển dọc
            const hIdx = Math.min(curR, tarR) * this.size + curC;
            if (this.hWalls.includes(hIdx)) hasWall = true;
        }

        if (hasWall) {
            this.gameOver("Structural Collision! Path Blocked.");
            return;
        }

        // Di chuyển hợp lệ
        this.currentPos = targetIdx;
        this.pathTaken.push(targetIdx);
        this.updatePlayerUI();

        if (targetIdx === this.endIdx) this.victory();
    },

    updatePlayerUI: function() {
        const cells = document.querySelectorAll('.maze-cell');
        cells.forEach((cell, idx) => {
            cell.classList.remove('bg-primary/20', 'border-primary');
            cell.innerHTML = cell.innerHTML.replace(/person/g, ''); // Xóa avatar cũ
            
            if (this.pathTaken.includes(idx)) {
                cell.classList.add('bg-primary/10');
            }
            if (idx === this.currentPos) {
                cell.innerHTML = '<span class="material-symbols-outlined text-primary text-3xl animate-bounce">person</span>';
                cell.classList.add('border-primary/50');
            }
            if (idx === this.endIdx && idx !== this.currentPos) {
                cell.innerHTML = '<span class="material-symbols-outlined text-accent-blue text-3xl">door_open</span>';
            }
        });
    },

    // Các hàm Timer, SwitchPhase, Victory, GameOver giữ cấu trúc cũ nhưng cập nhật UI tương ứng...
    // [Để tiết kiệm diện tích, các hàm này giống bản trước bạn đã chạy thành công]
    
    startTimer: function() {
        const timerSeconds = document.getElementById('timer-seconds');
        const timerCircle = document.getElementById('timer-circle');
        this.timerInterval = setInterval(() => {
            this.currentTime--;
            if (timerSeconds) timerSeconds.innerText = this.currentTime;
            if (timerCircle) timerCircle.style.strokeDashoffset = 276 - (this.currentTime / this.memoTime) * 276;
            if (this.currentTime <= 0) this.switchToActionPhase();
        }, 1000);
    },

    switchToActionPhase: function() {
        clearInterval(this.timerInterval);
        this.phase = 'ACTION';
        document.getElementById('phase-label').innerText = "Action Phase";
        document.getElementById('projection-sidebar').classList.add('opacity-10', 'grayscale', 'pointer-events-none');
        const badge = document.getElementById('status-badge');
        badge.innerText = "ACTIVE"; badge.className = "px-2 py-1 bg-green-500/20 rounded text-[9px] font-bold text-green-500";
    },

    victory: async function() {
        const score = 2000 + (this.size * 200);
        alert(`ACCESS GRANTED: +${score} PTS`);
        const username = localStorage.getItem('username');
        if (username) {
            await fetch('http://localhost:3000/api/user/highscore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, game: 'maze', score }) });
            await fetch('http://localhost:3000/api/user/reward', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, coins: 150, exp: 300, game: 'maze' }) });
        }
        localStorage.setItem('maze_level', (parseInt(localStorage.getItem('maze_level') || 0) + 1));
        location.reload();
    },

    gameOver: function(msg) {
        document.getElementById('maze-container').classList.add('shake-effect');
        setTimeout(() => {
            alert("SECURITY BREACH: " + msg);
            localStorage.setItem('maze_level', 0);
            location.reload();
        }, 500);
    },

    bindEvents: function() {
        document.getElementById('btn-commit').onclick = () => {
            if(this.currentPos !== this.endIdx) alert("You must reach the Exit before committing!");
        };
    },

    updateHeaderUI: function() {
        const coinEl = document.getElementById('user-coin');
        if (typeof Auth !== 'undefined' && Auth.user) {
            if (coinEl) coinEl.innerText = (Auth.user.coins || 0).toLocaleString();
            if (typeof UserProfile !== 'undefined') UserProfile.updateUI(Auth.user.exp || 0, Auth.user.avatarId || 'avatar_1');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => MazeGame.init());