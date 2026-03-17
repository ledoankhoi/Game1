/* file: public/js/games/decryption.js */

const DecryptionGame = {
    sequence: [],
    playerSequence: [],
    level: 1,
    score: 0,
    isCpuTurn: false,
    gridSize: 9, 
    colors: ['blue', 'pink', 'green'], 
    
    freqs: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33],

    init: function() {
        this.renderGrid();
        
        document.getElementById('btn-start').onclick = () => {
            document.getElementById('overlay-start').classList.add('hidden');
            this.startGame();
        };
    },

    renderGrid: function() {
        const grid = document.getElementById('game-grid');
        if(!grid) return;
        grid.innerHTML = '';
        for(let i=0; i<this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'signal-cell';
            cell.dataset.id = i;
            cell.dataset.color = this.colors[i % 3]; 

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
        
        const nextStep = Math.floor(Math.random() * this.gridSize);
        this.sequence.push(nextStep);

        let i = 0;
        const interval = setInterval(() => {
            this.activateCell(this.sequence[i]);
            i++;
            if (i >= this.sequence.length) {
                clearInterval(interval);
                setTimeout(() => {
                    this.isCpuTurn = false;
                    this.msg("DECRYPT NOW!");
                }, 400);
            }
        }, 600); // Tăng tốc độ phát một chút để game kịch tính hơn
    },

    handleInput: function(id) {
        if (this.isCpuTurn) return;

        this.activateCell(id);
        this.playerSequence.push(id);

        const currentStep = this.playerSequence.length - 1;
        
        if (this.playerSequence[currentStep] !== this.sequence[currentStep]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.score += (this.level * 20); // Tăng điểm mỗi vòng
            this.level++;
            this.updateUI();
            this.isCpuTurn = true;
            setTimeout(() => this.nextRound(), 1000);
        }
    },

    activateCell: function(id) {
        const cell = document.querySelector(`.signal-cell[data-id="${id}"]`);
        if (!cell) return;

        cell.classList.add('active');
        this.playTone(id);

        setTimeout(() => {
            cell.classList.remove('active');
        }, 300);
    },

    playTone: function(id) {
        try {
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
        } catch(e) { /* Trình duyệt chặn audio nếu chưa click */ }
    },

    gameOver: async function() {
        this.isCpuTurn = true;
        
        // Hiệu ứng sai
        const grid = document.getElementById('game-grid');
        if(grid) grid.classList.add('shake-effect');
        document.querySelectorAll('.signal-cell').forEach(c => c.dataset.color = 'red');
        this.msg("CRITICAL ERROR: SIGNAL SEVERED");

        // 1. GỬI ĐIỂM LÊN SERVER QUA REWARD MANAGER
        if (typeof RewardManager !== 'undefined' && typeof RewardManager.submitScore === 'function') {
            const reward = await RewardManager.submitScore('decryption', this.score);
            if (reward) {
                document.getElementById('go-reward-container').classList.remove('hidden');
                document.getElementById('go-earned-coins').innerText = `+${reward.coins}`;
                document.getElementById('go-earned-exp').innerText = `+${reward.exp}`;
            }
        }

        // 2. CẬP NHẬT UI OVERLAY
        document.getElementById('go-final-level').innerText = this.level.toString().padStart(2, '0');
        document.getElementById('go-final-score').innerText = this.score.toLocaleString();

        // 3. HIỂN THỊ OVERLAY
        setTimeout(() => {
            const overlay = document.getElementById('decrypt-gameover-overlay');
            const panel = document.getElementById('decrypt-gameover-panel');
            if(overlay && panel) {
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    panel.classList.remove('scale-95');
                    panel.classList.add('scale-100');
                }, 50);
            }
        }, 1000);
    },

    updateUI: function() {
        const scoreEl = document.getElementById('current-score'); // Header
        const headerScore = document.getElementById('score-display'); // Local
        if (scoreEl) scoreEl.innerText = this.score.toLocaleString();
        if (headerScore) headerScore.innerText = `PTS: ${this.score}`;
        
        const levelEl = document.getElementById('level-indicator');
        if (levelEl) levelEl.innerText = `Protocol Level: ${this.level}`;
        
        const percent = Math.min((this.level / 20) * 100, 100);
        const fill = document.getElementById('status-fill');
        if(fill) fill.style.width = `${percent}%`;
    },

    msg: function(text) {
        const msgEl = document.getElementById('game-msg');
        if(msgEl) msgEl.innerText = text;
    }
};

document.addEventListener('DOMContentLoaded', () => DecryptionGame.init());