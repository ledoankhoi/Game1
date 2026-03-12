/* file: public/js/games/maze.js */

const MazeGame = {
    size: 5,
    memoTime: 60,   // 60 giây để ghi nhớ
    actionTime: 60, // 60 giây để thoát hiểm (MỚI)
    currentTime: 60,
    timerInterval: null,
    phase: 'MEMO',  // MEMO -> ACTION

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
        console.log("Maze Protocol: Dual Timer System Activated.");
        this.resetGame();
        this.generateWalls();
        this.renderProjections(); 
        this.renderMainGrid();
        this.bindEvents();
        
        // Hiển thị lại sidebar hình chiếu (nếu bị ẩn từ ván trước)
        const sidebar = document.getElementById('projection-sidebar');
        if(sidebar) sidebar.style.display = 'flex'; 

        // Khởi động đồng hồ Ghi nhớ ngay lập tức
        this.startTimer(); 
        setTimeout(() => this.updateHeaderUI(), 500);
    },

    resetGame: function() {
        this.phase = 'MEMO';
        this.currentTime = this.memoTime; // Đặt lại thời gian ghi nhớ
        this.hWalls = []; this.vWalls = [];
        this.layers = { red: {h:[], v:[]}, yellow: {h:[], v:[]}, blue: {h:[], v:[]} };
        this.currentPos = 0;
        this.pathTaken = [0];

        const lv = parseInt(localStorage.getItem('maze_level') || 0);
        this.size = 5 + Math.floor(lv / 3); 
        this.endIdx = (this.size * this.size) - 1;
        
        // Reset UI nút bấm
        const btnStart = document.getElementById('btn-start');
        if (btnStart) {
            btnStart.innerText = "BẮT ĐẦU (START)";
            btnStart.disabled = false;
            btnStart.classList.remove('opacity-50');
        }
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
            // Nếu đang ACTION thì cho phép click, ngược lại thì không
            cell.className = `maze-cell relative flex items-center justify-center rounded-sm bg-slate-800/40 border border-white/5 aspect-square transition-all ${this.phase === 'ACTION' ? 'cursor-pointer hover:bg-primary/5' : 'cursor-not-allowed opacity-50'}`;
            
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
            // Xóa sự kiện cũ để tránh bị gán chồng chéo
            btnStart.onclick = null; 
            btnStart.onclick = () => {
                if (this.phase === 'MEMO') {
                    this.switchToActionPhase();
                }
            };
        }
    },

    // --- HỆ THỐNG ĐỒNG HỒ (Đã sửa) ---
    startTimer: function() {
        // Xóa timer cũ nếu đang chạy
        if (this.timerInterval) clearInterval(this.timerInterval);

        const timerSeconds = document.getElementById('timer-seconds');
        const timerCircle = document.getElementById('timer-circle');
        
        // Xác định tổng thời gian của giai đoạn hiện tại để tính toán vòng tròn SVG
        const maxDuration = this.phase === 'MEMO' ? this.memoTime : this.actionTime;

        this.timerInterval = setInterval(() => {
            this.currentTime--;
            
            // Cập nhật số giây hiển thị
            if (timerSeconds) timerSeconds.innerText = this.currentTime;
            
            // Cập nhật vòng tròn đếm ngược (Giả sử chu vi là 276)
            if (timerCircle) {
                const offset = 276 - (this.currentTime / maxDuration) * 276;
                timerCircle.style.strokeDashoffset = offset;
            }
            
            // Xử lý khi hết giờ
            if (this.currentTime <= 0) {
                clearInterval(this.timerInterval); // Dừng timer hiện tại
                
                if (this.phase === 'MEMO') {
                    // Hết giờ ghi nhớ -> Tự động chuyển sang chạy
                    this.switchToActionPhase();
                } else {
                    // Hết giờ chạy -> Thua cuộc
                    this.gameOver("Hết thời gian! (Time Out)");
                }
            }
        }, 1000);
    },

    switchToActionPhase: function() {
        clearInterval(this.timerInterval); // Dừng timer MEMO
        this.phase = 'ACTION';
        
        // RESET THỜI GIAN VỀ 60s CHO GIAI ĐOẠN 2
        this.currentTime = this.actionTime; 
        
        // Cập nhật UI ngay lập tức để người chơi thấy 60s
        const timerSeconds = document.getElementById('timer-seconds');
        if (timerSeconds) timerSeconds.innerText = this.currentTime;

        // 1. Ẩn hoàn toàn 3 hình chiếu bên trái
        const sidebar = document.getElementById('projection-sidebar');
        if(sidebar) sidebar.style.display = 'none';

        // 2. Cập nhật nút Bắt đầu
        const btnStart = document.getElementById('btn-start');
        if(btnStart) {
            btnStart.innerText = "ĐANG CHẠY... (ESCAPING)";
            btnStart.disabled = true;
            btnStart.classList.add('opacity-50');
        }

        // 3. Render lại lưới để cho phép click
        this.renderMainGrid();

        // 4. BẮT ĐẦU ĐỒNG HỒ CHO GIAI ĐOẠN THOÁT
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

        let hasWall = false;
        if (curR === tarR) { 
            const vIdx = curR * (this.size - 1) + Math.min(curC, tarC);
            if (this.vWalls.includes(vIdx)) hasWall = true;
        } else { 
            const hIdx = Math.min(curR, tarR) * this.size + curC;
            if (this.hWalls.includes(hIdx)) hasWall = true;
        }

        if (hasWall) {
            this.gameOver("Đâm phải tường tàng hình!");
            return;
        }

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
                cell.innerHTML = '<span class="material-symbols-outlined text-primary text-3xl animate-bounce">person</span>';
                cell.classList.add('border-primary/50');
            }
        });
    },

    victory: async function() {
        clearInterval(this.timerInterval); // Dừng đồng hồ
        const score = 2000 + (this.size * 200) + (this.currentTime * 10); // Cộng điểm thưởng thời gian
        setTimeout(() => alert(`THÀNH CÔNG! +${score} điểm`), 100);
        
        const username = localStorage.getItem('username');
        if (username) {
            // API calls...
        }
        localStorage.setItem('maze_level', (parseInt(localStorage.getItem('maze_level') || 0) + 1));
        location.reload();
    },

    gameOver: function(msg) {
        clearInterval(this.timerInterval); // Dừng đồng hồ
        const grid = document.getElementById('main-maze-grid');
        if(grid) grid.classList.add('shake-effect');
        
        setTimeout(() => {
            // Thay đổi ở đây: Chuyển hướng sang trang maze_gameover.html thay vì alert
            // Bạn có thể truyền thông báo lỗi qua URL parameters nếu cần hiển thị chi tiết lỗi
            // Ví dụ: window.location.href = `maze_gameover.html?error=${encodeURIComponent(msg)}`;
            
            // Đặt lại level về 0 (theo logic cũ của bạn) trước khi chuyển trang
            localStorage.setItem('maze_level', 0);
            
            window.location.href = 'maze_gameover.html'; 
        }, 500);
    },

    // ... (các phương thức khác giữ nguyên)


    updateHeaderUI: function() {
        const coinEl = document.getElementById('user-coin');
        if (typeof Auth !== 'undefined' && Auth.user && coinEl) {
            coinEl.innerText = (Auth.user.coins || 0).toLocaleString();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => MazeGame.init());