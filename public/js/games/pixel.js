/**
 * PIXEL.JS - Elite League Logic (Keyboard Rotation Edition)
 */

const PixelGame = {
    level: 1,
    score: 0,
    targetGrid: [],
    sourceGrids: [],
    selectedIndices: [],
    rotations: {},
    attemptCount: 0,
    activeFocusIndex: null, // Hình đang được chọn để xoay

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
        this.generateLevel();
        
        document.getElementById('btn-reset').onclick = () => this.resetSelection();
        document.getElementById('btn-submit').onclick = () => this.checkWin();

        // LẮNG NGHE BÀN PHÍM
        document.addEventListener('keydown', (e) => {
            if (this.activeFocusIndex === null) return;
            
            // Chỉ xoay khi hình đó đang nằm trong danh sách đã chọn
            if (!this.selectedIndices.includes(this.activeFocusIndex)) return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.rotateGrid(this.activeFocusIndex, 1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.rotateGrid(this.activeFocusIndex, -1);
            }
        });
    },

    nextLevel: function() {
        document.getElementById('modal-complete').classList.add('hidden');
        this.level++;
        this.score += 150;
        if(typeof ScoreManager !== 'undefined') ScoreManager.save('pixel', this.score);
        document.getElementById('score-display').innerText = this.score;
        document.getElementById('level-display').innerText = this.level;
        this.generateLevel();
    },

    gameOver: function() {
        if(typeof ScoreManager !== 'undefined') ScoreManager.save('pixel', this.score);
        localStorage.setItem('pixel_last_score', this.score);
        localStorage.setItem('pixel_last_level', this.level);
        window.location.href = 'pixel_gameover.html';
    },

    resetSelection: function() {
        this.selectedIndices = [];
        this.rotations = {};
        this.activeFocusIndex = null;
        this.renderSource();
        this.updateResultPreview();
    },

    generateLevel: function() {
        this.attemptCount = 0;
        this.activeFocusIndex = null;
        document.getElementById('log-container').innerHTML = '<div class="text-[10px] text-slate-600 text-center italic mt-4">Level initialized...</div>';
        
        this.selectedIndices = [];
        this.rotations = {};
        this.sourceGrids = [];

        // Logic sinh đề (Giữ nguyên)
        let keys = [[], [], []];
        for (let i = 0; i < 9; i++) {
            const layers = Math.random() < 0.3 ? 0 : (Math.random() < 0.6 ? 1 : 2);
            let availableKeys = [0, 1, 2].sort(() => Math.random() - 0.5);
            keys[0][i] = 0; keys[1][i] = 0; keys[2][i] = 0;
            for (let L = 0; L < layers; L++) {
                keys[availableKeys[L]][i] = Math.floor(Math.random() * 3) + 1;
            }
        }

        for(let k=0; k<6; k++) {
            let noise = [];
            for(let i=0; i<9; i++) noise.push(Math.random() < 0.3 ? (Math.floor(Math.random()*3)+1) : 0);
            this.sourceGrids.push(noise);
        }

        this.sourceGrids.push(...keys);
        this.sourceGrids.sort(() => Math.random() - 0.5);
        this.targetGrid = this.calculateMix(keys[0], keys[1], keys[2], 0, 0, 0);

        this.renderTarget();
        this.renderSource();
        this.updateResultPreview();
    },

    renderTarget: function() {
        const container = document.getElementById('target-grid');
        container.innerHTML = '';
        this.targetGrid.forEach(val => {
            const div = document.createElement('div');
            div.className = `pixel-cell ${val || ''}`;
            container.appendChild(div);
        });
    },

    // --- CẬP NHẬT RENDER (Xóa nút xoay, thêm class Focus) ---
    renderSource: function() {
        const container = document.getElementById('source-container');
        container.innerHTML = '';
        document.getElementById('selection-count').innerText = `${this.selectedIndices.length}/3`;

        this.sourceGrids.forEach((grid, idx) => {
            const isSelected = this.selectedIndices.includes(idx);
            const isFocused = (this.activeFocusIndex === idx && isSelected); // Chỉ focus nếu đã chọn
            const rotation = this.rotations[idx] || 0;

            const item = document.createElement('div');
            item.className = `source-item relative group flex-shrink-0 ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`;

            // Badge thứ tự
            if(isSelected) {
                const order = this.selectedIndices.indexOf(idx) + 1;
                item.innerHTML += `<div class="select-badge">${order}</div>`;
            }

            
            const gridDiv = document.createElement('div');
            gridDiv.className = 'pixel-grid w-20 h-20 lg:w-24 lg:h-24 bg-background-dark cursor-pointer transition-all duration-200';
            gridDiv.style.transform = `rotate(${rotation * 90}deg)`;
            
            // Click xử lý chọn/bỏ chọn
            gridDiv.onclick = () => this.toggleSelection(idx);

            grid.forEach(val => {
                const cell = document.createElement('div');
                cell.className = `pixel-cell ${this.COLORS[val] || ''}`;
                if(val) cell.style.opacity = "0.9";
                gridDiv.appendChild(cell);
            });

            item.appendChild(gridDiv);
            container.appendChild(item);
        });
    },

    toggleSelection: function(index) {
        const pos = this.selectedIndices.indexOf(index);
        
        if (pos > -1) {
            // Bỏ chọn -> Nếu đang focus thì bỏ focus luôn
            this.selectedIndices.splice(pos, 1);
            if (this.activeFocusIndex === index) {
                this.activeFocusIndex = null;
            }
        } else {
            // Chọn mới -> Set làm Focus ngay lập tức
            if (this.selectedIndices.length < 3) {
                this.selectedIndices.push(index);
                this.activeFocusIndex = index;
            }
        }
        
        // Nếu click vào một cái ĐÃ chọn nhưng không focus -> Chuyển focus sang nó
        if (pos > -1 && this.activeFocusIndex !== index) {
             // Logic này tuỳ chọn: Muốn click để bỏ chọn hay click để focus?
             // Hiện tại logic trên là click để bỏ chọn. 
             // Nếu muốn trải nghiệm tốt hơn: Click lần 1 vào cái đã chọn -> Focus. Click lần 2 -> Bỏ chọn.
             // Nhưng để đơn giản, ta giữ logic: Click -> Bỏ chọn.
             // Khi vừa chọn xong -> Auto Focus cái mới nhất.
        }

        this.renderSource();
        this.updateResultPreview();
    },

    rotateGrid: function(index, direction) {
        let cur = this.rotations[index] || 0;
        cur += direction;
        if(cur < 0) cur = 3; if(cur > 3) cur = 0;
        this.rotations[index] = cur;
        
        // Render lại nhưng giữ focus
        this.renderSource();
        this.updateResultPreview();
    },

    getRotatedValues: function(flatGrid, rotations) {
        if (rotations === 0) return [...flatGrid];
        let matrix = [
            [flatGrid[0], flatGrid[1], flatGrid[2]],
            [flatGrid[3], flatGrid[4], flatGrid[5]],
            [flatGrid[6], flatGrid[7], flatGrid[8]]
        ];
        for (let k = 0; k < rotations; k++) {
            const newMatrix = [[0,0,0],[0,0,0],[0,0,0]];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    newMatrix[c][2 - r] = matrix[r][c];
                }
            }
            matrix = newMatrix;
        }
        return [matrix[0][0],matrix[0][1],matrix[0][2],matrix[1][0],matrix[1][1],matrix[1][2],matrix[2][0],matrix[2][1],matrix[2][2]];
    },

    updateResultPreview: function() {
        const container = document.getElementById('result-grid');
        const overlay = document.getElementById('status-overlay');
        Array.from(container.children).forEach(c => { if(c.id !== 'status-overlay') c.remove(); });

        if (this.selectedIndices.length === 0) {
            overlay.classList.add('hidden');
            return;
        }

        const gA = this.selectedIndices[0] !== undefined ? this.getRotatedValues(this.sourceGrids[this.selectedIndices[0]], this.rotations[this.selectedIndices[0]] || 0) : null;
        const gB = this.selectedIndices[1] !== undefined ? this.getRotatedValues(this.sourceGrids[this.selectedIndices[1]], this.rotations[this.selectedIndices[1]] || 0) : null;
        const gC = this.selectedIndices[2] !== undefined ? this.getRotatedValues(this.sourceGrids[this.selectedIndices[2]], this.rotations[this.selectedIndices[2]] || 0) : null;

        const result = this.calculateMix(gA, gB, gC);

        if (result === 'INVALID') {
            overlay.classList.remove('hidden');
            for(let i=0; i<9; i++) {
                const div = document.createElement('div');
                div.className = 'pixel-cell bg-invalid opacity-50';
                container.appendChild(div);
            }
        } else {
            overlay.classList.add('hidden');
            result.forEach(cls => {
                const div = document.createElement('div');
                div.className = `pixel-cell ${cls || ''}`;
                container.appendChild(div);
            });
        }
    },

    calculateMix: function(g1, g2, g3) {
        let finalGrid = [];
        for (let i = 0; i < 9; i++) {
            let colors = [];
            if (g1 && g1[i]) colors.push(g1[i]);
            if (g2 && g2[i]) colors.push(g2[i]);
            if (g3 && g3[i]) colors.push(g3[i]);
            if (colors.length > 2) return 'INVALID';
            if (colors.length === 0) finalGrid.push(null);
            else if (colors.length === 1) finalGrid.push(this.COLORS[colors[0]]);
            else { colors.sort(); finalGrid.push(this.MIX_MAP[`${colors[0]}-${colors[1]}`]); }
        }
        return finalGrid;
    },

    addToLog: function(status, message) {
        const container = document.getElementById('log-container');
        const div = document.createElement('div');
        let colorClass = status === 'SUCCESS' ? 'border-primary bg-primary/5' : 'border-red-500 bg-red-500/5';
        let textClass = status === 'SUCCESS' ? 'text-primary' : 'text-red-400';
        let icon = status === 'SUCCESS' ? 'check_circle' : 'error';

        div.className = `p-3 rounded border-l-2 ${colorClass} text-xs flex gap-3 items-start animate-[fadeInLeft_0.3s_ease-out]`;
        div.innerHTML = `
            <span class="material-icons text-sm ${textClass} mt-0.5">${icon}</span>
            <div>
                <div class="font-bold ${textClass} uppercase text-[10px] tracking-wider mb-1">Attempt #${this.attemptCount}</div>
                <div class="text-slate-300 leading-tight">${message}</div>
            </div>
        `;
        container.prepend(div);
    },

    checkWin: function() {
        this.attemptCount++;
        if (this.selectedIndices.length !== 3) {
            this.addToLog('FAIL', 'Missing fragments. Need 3 source blocks.');
            return;
        }
        const overlay = document.getElementById('status-overlay');
        if (!overlay.classList.contains('hidden')) {
            this.addToLog('FAIL', 'Invalid overlap. Too many color layers.');
            return;
        }
        
        const currentResult = this.calculateMix(
            this.getRotatedValues(this.sourceGrids[this.selectedIndices[0]], this.rotations[this.selectedIndices[0]] || 0),
            this.getRotatedValues(this.sourceGrids[this.selectedIndices[1]], this.rotations[this.selectedIndices[1]] || 0),
            this.getRotatedValues(this.sourceGrids[this.selectedIndices[2]], this.rotations[this.selectedIndices[2]] || 0)
        );
        
        const isMatch = JSON.stringify(currentResult) === JSON.stringify(this.targetGrid);

        if (isMatch) {
            this.addToLog('SUCCESS', 'Sequence matched perfectly.');
            document.getElementById('modal-complete').classList.remove('hidden');
        } else {
            let matchCount = 0;
            for(let i=0; i<9; i++) { if(currentResult[i] === this.targetGrid[i]) matchCount++; }
            const accuracy = Math.round((matchCount / 9) * 100);
            this.addToLog('FAIL', `Mismatch detected. Accuracy: ${accuracy}%. Check orientation.`);
        }
    }
};

window.onload = () => PixelGame.init();