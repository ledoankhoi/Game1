/**
 * SPEED.JS - Core Logic (Integrated with RewardManager)
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

        // Gắn sự kiện nút (Tránh gắn đè nhiều lần)
        for (let i = 0; i < 6; i++) {
            const btn = document.getElementById(`ans-btn-${i}`);
            if(!btn) continue;
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

        const eqEl = document.getElementById('math-equation');
        if(eqEl) {
            eqEl.innerHTML = `
                <span>${a}</span>
                <span class="text-ice-accent mx-2">${operator}</span>
                <span>${b}</span>
            `;
        }

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
            if(btn) btn.querySelector('span').innerText = ansArray[i];
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
                this.gameOver("Hết thời gian (Time Out)");
            } else {
                this.updateTimerUI();
            }
        }, 50);
    },

    updateTimerUI: function() {
        const bar = document.getElementById('timer-bar');
        const text = document.getElementById('timer-text');
        if(!bar || !text) return;

        bar.style.width = `${Math.max(0, this.timeLeft)}%`;
        text.innerText = `${Math.floor(this.timeLeft)}%`;
        
        if (this.timeLeft < 30) {
            bar.className = "h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-100 ease-linear";
        } else {
            bar.className = "h-full bg-primary shadow-[0_0_15px_rgba(37,140,244,0.8)] transition-all duration-100 ease-linear";
        }
    },

    recordHistory: function(playerChoice, status) {
        const logEntry = {
            equation: this.currentEquationStr,
            correct: this.correctAnswer,
            choice: playerChoice,
            status: status
        };
        this.history.push(logEntry);

        // Đã đồng bộ với hàm addToGameHistory của file speed.html mới
        if(typeof window.addToGameHistory === 'function') {
            window.addToGameHistory(this.currentEquationStr, playerChoice !== null ? playerChoice : '---', status === 'CORRECT');
        }
    },

    checkAnswer: function(val) {
        if (!this.isPlaying) return;

        if (val === this.correctAnswer) {
            this.recordHistory(val, 'CORRECT'); 
            this.score += 50;
            this.updateScoreUI();
            
            // XÓA BỎ MÃ GỬI THƯỞNG LẮT NHẮT CŨ TẠI ĐÂY
            // Chúng ta sẽ tổng kết 1 lần khi game over để tránh bị spam server

            this.generateLevel();
        } else {
            this.recordHistory(val, 'WRONG'); 
            this.gameOver(`Sai kết quả (Chose ${val}, Expected ${this.correctAnswer})`);
        }
    },

    updateScoreUI: function() {
        const scoreEl = document.getElementById('current-score');
        if(scoreEl) scoreEl.innerText = this.score.toLocaleString();
    },

    gameOver: async function(reason) {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        console.log("Game Over:", reason);

        // 1. Điền thông tin cơ bản
        document.getElementById('fail-reason').innerText = reason;
        document.getElementById('final-score-go').innerText = this.score.toLocaleString();

        // 2. GỌI REWARD MANAGER ĐỂ LƯU ĐIỂM (NGẦM)
        if (typeof RewardManager !== 'undefined') {
            const reward = await RewardManager.submitScore('speed', this.score);
            if (reward) {
                document.getElementById('earned-coins').innerText = `+${reward.coins}`;
                document.getElementById('earned-exp').innerText = `+${reward.exp}`;
                document.getElementById('current-level').innerText = reward.level;
                document.getElementById('exp-text').innerText = `${reward.currentExp} / ${reward.nextExp}`;
                
                if (reward.leveledUp) document.getElementById('level-up-badge').classList.remove('hidden');

                setTimeout(() => {
                    const percent = Math.min(100, (reward.currentExp / reward.nextExp) * 100);
                    document.getElementById('exp-bar').style.width = `${percent}%`;
                }, 500);
            }
        }

        // 3. VẼ NHẬT KÝ CHIẾN ĐẤU (LOGS)
        const logContainer = document.getElementById('go-log-container');
        if (logContainer) {
            logContainer.innerHTML = '';
            this.history.forEach((item, index) => {
                const isSuccess = item.status === 'CORRECT';
                const color = isSuccess ? 'text-primary border-primary bg-primary/10' : 'text-red-400 border-red-500 bg-red-500/10';
                const icon = isSuccess ? 'check_circle' : (item.status === 'TIMEOUT' ? 'timer_off' : 'cancel');
                
                logContainer.innerHTML += `
                    <div class="flex items-center justify-between p-3 rounded-xl border-l-4 ${color} mb-2">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-gray-400 uppercase tracking-widest">SEQ_${index + 1}</span>
                            <span class="font-mono text-sm font-bold text-white">${item.equation} = ${item.choice !== null ? item.choice : 'N/A'}</span>
                        </div>
                        <span class="material-symbols-outlined text-lg">${icon}</span>
                    </div>
                `;
            });
        }

        // 4. HIỂN THỊ MÀN HÌNH OVERLAY BĂNG GIÁ LÊN
        const overlay = document.getElementById('speed-gameover-overlay');
        const panel = document.getElementById('speed-gameover-panel');
        
        overlay.classList.remove('hidden');
        overlay.classList.add('flex'); // Bật flex để căn giữa
        
        // Kích hoạt hiệu ứng Fade in & Trượt lên
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            panel.classList.remove('translate-y-10');
        }, 50);
    }
};

window.onload = () => SpeedGame.init();