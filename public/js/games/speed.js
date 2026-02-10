/**
 * SPEED.JS - Core Logic (Synced with Live Log)
 */

const SpeedGame = {
    score: 0,
    timeLeft: 100,
    timerInterval: null,
    isPlaying: false,
    correctAnswer: 0,
    currentEquationStr: "",
    difficulty: 1,
    history: [],

    init: function() {
        console.log("Crystal Core: Initialized");
        this.score = 0;
        this.timeLeft = 100;
        this.difficulty = 1;
        this.isPlaying = true;
        this.history = [];
        
        this.updateScoreUI();
        this.generateLevel();
        this.startTimer();

        // Reset log UI
        const logContainer = document.getElementById('live-log-container');
        if(logContainer) logContainer.innerHTML = '';

        // Gắn sự kiện nút
        for (let i = 0; i < 6; i++) {
            const btn = document.getElementById(`ans-btn-${i}`);
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                const val = parseInt(e.currentTarget.innerText);
                this.checkAnswer(val);
            });
        }
    },

    generateLevel: function() {
        if (this.score > 500) this.difficulty = 2;
        if (this.score > 1500) this.difficulty = 3;

        let a, b, operator, result;
        const opRandom = Math.random();

        if (opRandom < 0.4) {
            a = Math.floor(Math.random() * (10 * this.difficulty)) + 1;
            b = Math.floor(Math.random() * (10 * this.difficulty)) + 1;
            operator = '+';
            result = a + b;
        } else if (opRandom < 0.7) {
            a = Math.floor(Math.random() * (20 * this.difficulty)) + 5;
            b = Math.floor(Math.random() * a);
            operator = '-';
            result = a - b;
        } else {
            a = Math.floor(Math.random() * (5 * this.difficulty)) + 2;
            b = Math.floor(Math.random() * 9) + 2;
            operator = '×';
            result = a * b;
        }

        this.correctAnswer = result;
        this.currentEquationStr = `${a} ${operator} ${b}`;

        document.getElementById('math-equation').innerHTML = `
            <span>${a}</span>
            <span class="text-ice-accent mx-2">${operator}</span>
            <span>${b}</span>
        `;

        this.generateAnswers(result);
        
        // Thưởng thời gian (Max 100)
        this.timeLeft = Math.min(100, this.timeLeft + 5);
        this.updateTimerUI();
    },

    generateAnswers: function(correct) {
        let answers = new Set();
        answers.add(correct);
        while (answers.size < 6) {
            let offset = Math.floor(Math.random() * 10) - 5;
            if (offset === 0) offset = 1;
            let wrong = correct + offset;
            if (wrong < 0) wrong = 0;
            answers.add(wrong);
        }
        const ansArray = Array.from(answers).sort(() => Math.random() - 0.5);
        for (let i = 0; i < 6; i++) {
            const btn = document.getElementById(`ans-btn-${i}`);
            btn.querySelector('span').innerText = ansArray[i];
        }
    },

    startTimer: function() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isPlaying) return;
            const decay = 0.2 * (1 + (this.difficulty * 0.1)); 
            this.timeLeft -= decay;
            
            if (this.timeLeft <= 0) {
                this.recordHistory(null, "TIMEOUT");
                this.gameOver("Thermal Depletion");
            } else {
                this.updateTimerUI();
            }
        }, 50);
    },

    updateTimerUI: function() {
        const bar = document.getElementById('timer-bar');
        const text = document.getElementById('timer-text');
        bar.style.width = `${Math.max(0, this.timeLeft)}%`;
        text.innerText = `${Math.floor(this.timeLeft)}%`;
        
        if (this.timeLeft < 30) {
            bar.className = "absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 w-full shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all duration-100 ease-linear";
        } else {
            bar.className = "absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-ice-accent to-white w-full shadow-[0_0_15px_rgba(37,140,244,0.5)] transition-all duration-100 ease-linear";
        }
    },

    // --- QUAN TRỌNG: Ghi Log vào Sidebar ---
    recordHistory: function(playerChoice, status) {
        // 1. Lưu data
        const logEntry = {
            equation: this.currentEquationStr,
            correct: this.correctAnswer,
            choice: playerChoice,
            status: status
        };
        this.history.push(logEntry);

        // 2. Hiển thị lên Sidebar
        const container = document.getElementById('live-log-container');
        if (container) {
            // Xóa text "Initializing..."
            if (this.history.length === 1) container.innerHTML = '';

            const div = document.createElement('div');
            
            // Style
            let borderClass = status === 'CORRECT' ? 'border-primary' : 'border-red-500';
            let bgClass = status === 'CORRECT' ? 'bg-primary/10' : 'bg-red-500/10';
            let icon = status === 'CORRECT' ? 'check' : (status === 'TIMEOUT' ? 'timer_off' : 'close');
            let textClass = status === 'CORRECT' ? 'text-white' : 'text-red-300';
            
            div.className = `flex items-center justify-between p-2 rounded border-l-2 ${borderClass} ${bgClass} text-xs animate-log-entry mb-2`;
            div.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-[10px] text-primary/60 font-mono">${logEntry.equation}</span>
                    <span class="font-bold ${textClass}">${playerChoice !== null ? playerChoice : '---'}</span>
                </div>
                <span class="material-icons-outlined text-sm opacity-50 ${textClass}">${icon}</span>
            `;

            // Chèn lên đầu (Mới nhất ở trên)
            container.prepend(div);
        }
    },

    checkAnswer: function(val) {
        if (!this.isPlaying) return;

        if (val === this.correctAnswer) {
            this.recordHistory(val, 'CORRECT'); // Hiện log màu xanh
            this.score += 50;
            this.updateScoreUI();
            this.generateLevel();
        } else {
            this.recordHistory(val, 'WRONG'); // Hiện log màu đỏ
            this.gameOver(`Calculation Error: Chose ${val}, Expected ${this.correctAnswer}`);
        }
    },

    updateScoreUI: function() {
        document.getElementById('current-score').innerText = this.score.toLocaleString();
    },

    gameOver: function(reason) {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        console.log("Game Over:", reason);

        if (typeof ScoreManager !== 'undefined') {
            ScoreManager.save('speed', this.score);
        }

        // Lưu bộ nhớ
        localStorage.setItem('speed_last_score', this.score);
        localStorage.setItem('speed_fail_reason', reason);
        localStorage.setItem('speed_history', JSON.stringify(this.history));

        setTimeout(() => {
            window.location.href = 'speed_gameover.html';
        }, 500);
    }
};

window.onload = () => SpeedGame.init();