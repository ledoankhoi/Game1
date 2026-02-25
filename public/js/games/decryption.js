const DecryptionGame = {
    sequence: [],
    playerSequence: [],
    level: 1,
    score: 0,
    isCpuTurn: false,
    gridSize: 9, // 3x3
    colors: ['blue', 'pink', 'green'], // Các màu sẽ random
    
    // Âm thanh (Giả lập tần số)
    freqs: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33],

    init: function() {
        this.renderGrid();
        
        document.getElementById('btn-start').onclick = () => {
            document.getElementById('overlay-start').classList.add('hidden'); // Ẩn overlay
            this.startGame();
        };
    },

    renderGrid: function() {
        const grid = document.getElementById('game-grid');
        grid.innerHTML = '';
        for(let i=0; i<this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'signal-cell';
            cell.dataset.id = i;
            
            // Random màu cho mỗi ô để đẹp hơn
            const color = this.colors[i % 3]; 
            cell.dataset.color = color;

            cell.onclick = () => this.handleInput(i);
            grid.appendChild(cell);
        }
    },

    startGame: function() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.updateUI();
        this.nextRound();
    },

    nextRound: function() {
        this.playerSequence = [];
        this.isCpuTurn = true;
        this.msg("RECEIVING SIGNAL...");
        
        // Thêm 1 bước vào chuỗi
        const nextStep = Math.floor(Math.random() * this.gridSize);
        this.sequence.push(nextStep);

        // Phát lại chuỗi
        let i = 0;
        const interval = setInterval(() => {
            this.activateCell(this.sequence[i]);
            i++;
            if (i >= this.sequence.length) {
                clearInterval(interval);
                this.isCpuTurn = false;
                this.msg("DECRYPT NOW!");
            }
        }, 800); // Tốc độ phát (800ms)
    },

    handleInput: function(id) {
        if (this.isCpuTurn) return; // Không cho bấm khi máy đang chạy

        this.activateCell(id); // Hiệu ứng bấm
        this.playerSequence.push(id);

        // Kiểm tra đúng/sai ngay lập tức
        const currentStep = this.playerSequence.length - 1;
        
        if (this.playerSequence[currentStep] !== this.sequence[currentStep]) {
            this.gameOver();
            return;
        }

        // Nếu đúng hết chuỗi hiện tại
        if (this.playerSequence.length === this.sequence.length) {
            this.score += (this.level * 10);
            this.level++;
            this.updateUI();
            this.isCpuTurn = true;
            setTimeout(() => this.nextRound(), 1000); // Chờ 1s rồi qua màn
        }
    },

    activateCell: function(id) {
        const cell = document.querySelector(`.signal-cell[data-id="${id}"]`);
        if (!cell) return;

        cell.classList.add('active');
        this.playTone(id); // Phát âm thanh

        setTimeout(() => {
            cell.classList.remove('active');
        }, 300);
    },

    playTone: function(id) {
        // Sử dụng Web Audio API đơn giản để tạo tiếng beep
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = this.freqs[id];
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
    },

    gameOver: function() {
        this.isCpuTurn = true;
        
        // Hiệu ứng sai (Đỏ lòe)
        const grid = document.getElementById('game-grid');
        grid.classList.add('shake-effect'); // Bạn cần class shake trong css chung
        document.querySelectorAll('.signal-cell').forEach(c => c.dataset.color = 'red');
        this.msg("SIGNAL LOST. SYSTEM FAILURE.");

        setTimeout(() => {
            alert(`GAME OVER! Final Score: ${this.score}`);
            location.reload();
        }, 1000);
    },

    updateUI: function() {
        document.getElementById('score-display').innerText = this.score;
        document.getElementById('level-display').innerText = this.level;
        
        // Thanh tiến trình (Giả lập)
        const percent = Math.min((this.level / 20) * 100, 100);
        document.getElementById('status-fill').style.width = `${percent}%`;
    },

    msg: function(text) {
        document.getElementById('game-msg').innerText = text;
    }
};

document.addEventListener('DOMContentLoaded', () => DecryptionGame.init());