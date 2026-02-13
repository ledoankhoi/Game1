/**
 * PIXEL.JS - Elite League Logic (Integrated with Server)
 */

const PixelGame = {
    level: 1,
    score: 0,
    targetGrid: [],
    sourceGrids: [],
    selectedIndices: [],
    rotations: {},
    activeFocusIndex: null,
    attemptCount: 0,

    COLORS: { 0: null, 1: 'bg-red', 2: 'bg-yellow', 3: 'bg-blue' },
    MIX_MAP: {
        '1-2': 'bg-orange', '2-1': 'bg-orange',
        '1-3': 'bg-purple', '3-1': 'bg-purple',
        '2-3': 'bg-green',  '3-2': 'bg-green',
        '1-1': 'bg-red', '2-2': 'bg-yellow', '3-3': 'bg-blue'
    },

    init: function() {
        this.level = 1;
        this.score = 0;
        // Xóa log hoàn toàn chỉ khi BẮT ĐẦU game mới
        const log = document.getElementById('log-container');
        if(log) log.innerHTML = ''; 
        
        this.generateLevel();
        
        const submitBtn = document.getElementById('btn-submit');
        if(submitBtn) submitBtn.onclick = () => this.checkWin();

        // Lấy lại điểm cũ nếu có
        this.loadUserData();

        document.addEventListener('keydown', (e) => {
            if (this.activeFocusIndex === null) return;
            if (!this.selectedIndices.includes(this.activeFocusIndex)) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); this.rotateGrid(this.activeFocusIndex, 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); this.rotateGrid(this.activeFocusIndex, -1); }
        });
    },

    loadUserData: async function() {
        const username = localStorage.getItem('username');
        if (!username) return;
        try {
            // Lấy thông tin user để hiển thị tiền (nếu cần)
            const res = await fetch('http://localhost:3000/api/user/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            // Có thể cập nhật UI tiền ở đây nếu trang game có hiển thị tiền
        } catch (e) {}
    },

    createMiniGridHTML: function(colorClasses) {
        let html = '<div class="mini-pixel-grid">';
        for (let i = 0; i < 9; i++) {
            html += `<div class="mini-pixel-cell ${colorClasses[i] || ''}"></div>`;
        }
        html += '</div>';
        return html;
    },

    // --- HÀM GHI LOG (GIỮ NGUYÊN DỮ LIỆU CŨ) ---
    addToLog: function(status, message, accuracy = null, visualData = null) {
        const container = document.getElementById('log-container');
        if(!container) return;

        const entry = document.createElement('div');
        
        // Style cho tiêu đề Level (Nếu message chứa từ Level)
        const isHeader = status === 'LEVEL_START';
        
        let colorCls = status === 'SUCCESS' ? 'text-primary border-primary/30' : 
                      (status === 'FAIL' ? 'text-red-400 border-red-500/30' : 'text-white border-white/10 bg-white/5');
        
        let icon = status === 'SUCCESS' ? 'check_circle' : 
                  (status === 'FAIL' ? 'sensors_off' : 'api');

        entry.className = `p-3 mb-2 border-l-2 bg-white/5 animate-log ${colorCls} ${isHeader ? 'mt-6 mb-4 border-l-primary bg-primary/10' : ''}`;
        
        let html = `
            <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-1 font-bold text-[9px] uppercase tracking-tighter">
                    <span class="material-icons text-[12px]">${icon}</span> ${isHeader ? 'System Protocol' : status}
                </div>
                <span class="text-[8px] opacity-40 font-mono">${new Date().toLocaleTimeString()}</span>
            </div>
            <p class="text-[10px] ${isHeader ? 'font-bold text-white' : 'text-slate-300'} leading-tight">${message}</p>
        `;

        if (visualData) {
            html += `<div class="mini-grid-container">`;
            visualData.fragments.forEach(frag => {
                html += this.createMiniGridHTML(frag.map(c => this.COLORS[c]));
            });
            html += `<span class="material-icons log-arrow">arrow_forward</span>`;
            html += this.createMiniGridHTML(visualData.result);
            html += `</div>`;
        }

        if (accuracy !== null) {
            html += `<div class="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full ${status==='SUCCESS'?'bg-primary':'bg-red-500'}" style="width:${accuracy}%"></div>
                     </div>`;
        }
        
        entry.innerHTML = html;
        container.prepend(entry); // Log mới nhất lên đầu
    },

    generateLevel: function() {
        this.activeFocusIndex = null;
        this.selectedIndices = [];
        this.rotations = {};
        this.sourceGrids = [];

        // Ghi tiêu đề cho Level mới trong Log
        this.addToLog('LEVEL_START', `>>> INITIATING LEVEL ${this.level} <<<`);

        // Logic sinh đề
        let keys = [[], [], []];
        for (let i = 0; i < 9; i++) {
            const layers = Math.random() < 0.3 ? 0 : (Math.random() < 0.6 ? 1 : 2);
            let slots = [0, 1, 2].sort(() => Math.random() - 0.5);
            keys[0][i] = 0; keys[1][i] = 0; keys[2][i] = 0;
            for (let L = 0; L < layers; L++) keys[slots[L]][i] = Math.floor(Math.random() * 3) + 1;
        }
        for(let k=0; k<6; k++) {
            let n = []; for(let i=0; i<9; i++) n.push(Math.random() < 0.3 ? Math.floor(Math.random()*3)+1 : 0);
            this.sourceGrids.push(n);
        }
        this.sourceGrids.push(...keys);
        this.sourceGrids.sort(() => Math.random() - 0.5);
        this.targetGrid = this.calculateMix(keys[0], keys[1], keys[2]);
        
        this.renderTarget();
        this.renderSource();
        this.updateResultPreview();
    },

    checkWin: function() {
        this.attemptCount++;
        if (this.selectedIndices.length !== 3) {
            this.addToLog('FAIL', 'Incomplete sequence. Need 3 fragments.');
            return;
        }

        const overlay = document.getElementById('status-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            this.gameOver("Overlap Conflict");
            return;
        }
        
        const frags = this.selectedIndices.map(idx => 
            this.getRotatedValues(this.sourceGrids[idx], this.rotations[idx] || 0)
        );
        const res = this.calculateMix(frags[0], frags[1], frags[2]);

        let match = 0;
        for(let i=0; i<9; i++) if(res[i] === this.targetGrid[i]) match++;
        const acc = Math.round((match/9)*100);

        if(acc === 100) {
            // THẮNG
            this.addToLog('SUCCESS', `Level ${this.level} Matched!`, 100, { fragments: frags, result: res });
            
            // --- GỌI API LƯU ĐIỂM & NHẬN THƯỞNG ---
            this.saveProgress();

            setTimeout(() => document.getElementById('modal-complete').classList.remove('hidden'), 400);
        } else {
            // THUA
            this.addToLog('FAIL', `Pattern mismatch (${acc}%). Terminating...`, acc, { fragments: frags, result: res });
            setTimeout(() => this.gameOver(`Mismatch detected (${acc}%)`), 500);
        }
    },

    // --- HÀM MỚI: Gửi điểm và nhận thưởng ---
    saveProgress: async function() {
        // Điểm thưởng qua màn
        const levelBonus = 200; 
        const expBonus = 50;
        game: 'pixel'; 
        this.score += levelBonus;

        const username = localStorage.getItem('username');
        if (!username) return;

        try {
            // 1. Cập nhật HighScore (nếu cao hơn kỷ lục cũ)
            await fetch('http://localhost:3000/api/user/highscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    game: 'pixel', // Key phải khớp server
                    score: this.score
                })
            });

            // 2. Nhận thưởng Coin & Exp
            await fetch('http://localhost:3000/api/user/reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    coins: 20, // Mỗi màn được 20 coin
                    exp: expBonus,
                    game: 'pixel'
                })
            });
            
            console.log("Đã lưu tiến trình lên server!");
        } catch (err) {
            console.error("Lỗi lưu điểm:", err);
        }
    },

    // --- CÁC HÀM PHỤ TRỢ (GIỮ NGUYÊN) ---
    calculateMix: function(g1, g2, g3) {
        let final = [];
        for (let i = 0; i < 9; i++) {
            let colors = [];
            if (g1 && g1[i]) colors.push(g1[i]);
            if (g2 && g2[i]) colors.push(g2[i]);
            if (g3 && g3[i]) colors.push(g3[i]);
            if (colors.length > 2) return 'INVALID';
            if (colors.length === 0) final.push(null);
            else if (colors.length === 1) final.push(this.COLORS[colors[0]]);
            else { colors.sort(); final.push(this.MIX_MAP[`${colors[0]}-${colors[1]}`]); }
        }
        return final;
    },
    renderTarget: function() {
        const container = document.getElementById('target-grid');
        if(!container) return;
        container.innerHTML = '';
        this.targetGrid.forEach(val => {
            const div = document.createElement('div');
            div.className = `pixel-cell ${val || ''}`;
            container.appendChild(div);
        });
    },
    renderSource: function() {
        const container = document.getElementById('source-container');
        if(!container) return;
        container.innerHTML = '';
        // Sửa lỗi null check
        const countDisplay = document.getElementById('selection-count');
        if(countDisplay) countDisplay.innerText = `${this.selectedIndices.length}/3`;
        
        this.sourceGrids.forEach((grid, idx) => {
            const isSelected = this.selectedIndices.includes(idx);
            const isFocused = (this.activeFocusIndex === idx && isSelected);
            const rot = this.rotations[idx] || 0;
            const wrap = document.createElement('div');
            wrap.className = `source-item relative group shrink-0 ${isSelected?'selected':''} ${isFocused?'focused':''}`;
            if(isSelected) {
                const badge = document.createElement('div');
                badge.className = 'select-badge';
                badge.innerText = this.selectedIndices.indexOf(idx) + 1;
                wrap.appendChild(badge);
            }
            const gridDiv = document.createElement('div');
            gridDiv.className = 'pixel-grid w-20 h-20 lg:w-24 lg:h-24 bg-background-dark cursor-pointer';
            gridDiv.style.transform = `rotate(${rot * 90}deg)`;
            gridDiv.onclick = () => this.toggleSelection(idx);
            grid.forEach(val => {
                const cell = document.createElement('div');
                cell.className = `pixel-cell ${this.COLORS[val] || ''}`;
                gridDiv.appendChild(cell);
            });
            wrap.appendChild(gridDiv);
            container.appendChild(wrap);
        });
    },
    toggleSelection: function(index) {
        const pos = this.selectedIndices.indexOf(index);
        if (pos > -1) {
            this.selectedIndices.splice(pos, 1);
            if (this.activeFocusIndex === index) this.activeFocusIndex = null;
        } else if (this.selectedIndices.length < 3) {
            this.selectedIndices.push(index);
            this.activeFocusIndex = index;
        }
        this.renderSource();
        this.updateResultPreview();
    },
    rotateGrid: function(idx, dir) {
        let cur = this.rotations[idx] || 0;
        cur = (cur + dir + 4) % 4;
        this.rotations[idx] = cur;
        this.renderSource();
        this.updateResultPreview();
    },
    getRotatedValues: function(flatGrid, rot) {
        if (rot === 0) return [...flatGrid];
        let m = [[flatGrid[0],flatGrid[1],flatGrid[2]],[flatGrid[3],flatGrid[4],flatGrid[5]],[flatGrid[6],flatGrid[7],flatGrid[8]]];
        for (let k = 0; k < rot; k++) {
            let next = [[0,0,0],[0,0,0],[0,0,0]];
            for(let r=0; r<3; r++) for(let c=0; c<3; c++) next[c][2-r] = m[r][c];
            m = next;
        }
        return [m[0][0],m[0][1],m[0][2],m[1][0],m[1][1],m[1][2],m[2][0],m[2][1],m[2][2]];
    },
    updateResultPreview: function() {
        const container = document.getElementById('result-grid');
        const overlay = document.getElementById('status-overlay');
        if(!container) return;
        Array.from(container.children).forEach(c => { if(c.id !== 'status-overlay') c.remove(); });
        if (this.selectedIndices.length === 0) { overlay.classList.add('hidden'); return; }
        const gA = this.selectedIndices[0] !== undefined ? this.getRotatedValues(this.sourceGrids[this.selectedIndices[0]], this.rotations[this.selectedIndices[0]]||0) : null;
        const gB = this.selectedIndices[1] !== undefined ? this.getRotatedValues(this.sourceGrids[this.selectedIndices[1]], this.rotations[this.selectedIndices[1]]||0) : null;
        const gC = this.selectedIndices[2] !== undefined ? this.getRotatedValues(this.sourceGrids[this.selectedIndices[2]], this.rotations[this.selectedIndices[2]]||0) : null;
        const res = this.calculateMix(gA, gB, gC);
        if (res === 'INVALID') {
            overlay.classList.remove('hidden');
            for(let i=0; i<9; i++) { let d = document.createElement('div'); d.className = 'pixel-cell bg-invalid opacity-50'; container.appendChild(d); }
        } else {
            overlay.classList.add('hidden');
            res.forEach(cls => { let d = document.createElement('div'); d.className = `pixel-cell ${cls||''}`; container.appendChild(d); });
        }
    },
    nextLevel: function() {
        document.getElementById('modal-complete').classList.add('hidden');
        this.level++;
        // Điểm đã được cộng trong hàm saveProgress, chỉ cần update UI
        const scoreDisplay = document.getElementById('score-display');
        const levelDisplay = document.getElementById('level-display');
        
        if(scoreDisplay) scoreDisplay.innerText = this.score;
        if(levelDisplay) levelDisplay.innerText = this.level;
        
        this.generateLevel();
    },
    gameOver: function(reason) {
        // Lưu log để hiển thị ở trang gameover
        const logContent = document.getElementById('log-container').innerHTML;
        localStorage.setItem('pixel_final_log', logContent);

        localStorage.setItem('pixel_last_score', this.score);
        localStorage.setItem('pixel_last_level', this.level);
        localStorage.setItem('pixel_fail_reason', reason);
        
        // Gửi điểm lần cuối trước khi chết
        this.saveProgress().then(() => {
            window.location.href = 'pixel_gameover.html';
        });
    }
};

window.onload = () => PixelGame.init();