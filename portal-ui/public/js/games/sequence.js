/**
 * SEQUENCE.JS - GENIUS EDITION (Integrated with Server)
 * Hệ thống sinh dãy số ngẫu nhiên với độ khó "Siêu Trí Tuệ"
 */

// Cấu hình Game
const GameConfig = {
    baseScore: 100,
    scoreMultiplier: 1.2, // Mỗi cấp khó điểm tăng 20%
    hintCost: 50
};

let gameState = {
    level: 1,
    score: 0,
    currentSequence: null // Lưu trữ dãy số hiện tại
};

document.addEventListener('DOMContentLoaded', () => { initGame(); });

function initGame() {
    console.log("Neon Lab: GENIUS CORE ACTIVATED");
    
    // Reset điểm về 0 mỗi khi chơi mới (để công bằng cho BXH)
    gameState.score = 0;
    gameState.level = 1;

    generateNewLevel();
    updateScoreUI();

    // Gắn sự kiện
    const btnPredict = document.getElementById('btn-predict');
    if(btnPredict) {
        const newBtn = btnPredict.cloneNode(true);
        btnPredict.parentNode.replaceChild(newBtn, btnPredict);
        newBtn.addEventListener('click', checkAnswer);
    }

    const btnHint = document.getElementById('btn-hint');
    if(btnHint) {
        const newHint = btnHint.cloneNode(true);
        btnHint.parentNode.replaceChild(newHint, btnHint);
        newHint.addEventListener('click', showHint);
    }

    const inputElement = document.getElementById('rule-input');
    if(inputElement) {
        inputElement.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
        inputElement.addEventListener('keydown', (e) => {
            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
        });
    }
}

// --- BỘ TẠO THUẬT TOÁN (THE CORE) ---
const LevelGenerator = {
    // 1. Dãy số học cơ bản (Cấp 1-3)
    generateArithmetic: (level) => {
        const start = Math.floor(Math.random() * 50);
        const diff = Math.floor(Math.random() * 10) + 2; 
        const seq = [start, start + diff, start + diff*2, start + diff*3];
        return {
            sequence: seq,
            next: start + diff*4,
            hint: `Cấp số cộng: Tăng đều ${diff} đơn vị.`,
            points: 100
        };
    },

    // 2. Dãy số nhân / Lũy thừa (Cấp 4-6)
    generateGeometric: (level) => {
        const start = Math.floor(Math.random() * 5) + 2;
        const ratio = Math.floor(Math.random() * 2) + 2; 
        const seq = [start, start * ratio, start * ratio*ratio, start * ratio*ratio*ratio];
        return {
            sequence: seq,
            next: start * Math.pow(ratio, 4),
            hint: `Cấp số nhân: Gấp ${ratio} lần số trước.`,
            points: 200
        };
    },

    // 3. Fibonacci & Tribonacci (Cấp 7-10)
    generateFibonacci: (level) => {
        const type = Math.random() > 0.5 ? 'fib' : 'tri';
        let seq = [];
        
        if (type === 'fib') {
            let a = Math.floor(Math.random() * 5) + 1;
            let b = Math.floor(Math.random() * 5) + 1;
            seq = [a, b, a+b, a+b+b]; 
            return {
                sequence: seq,
                next: seq[2] + seq[3],
                hint: "Tổng hai số liền trước (Fibonacci variation).",
                points: 300
            };
        } else {
            let a=1, b=1, c=2;
            seq = [a, b, c, a+b+c];
            return {
                sequence: seq,
                next: seq[1] + seq[2] + seq[3],
                hint: "Tổng ba số liền trước (Tribonacci).",
                points: 400
            };
        }
    },

    // 4. SIÊU TRÍ TUỆ: Dãy đan xen (Cấp 11-15)
    generateInterleaved: (level) => {
        const startA = Math.floor(Math.random() * 10);
        const diffA = 2; 
        const startB = Math.floor(Math.random() * 50) + 50;
        const diffB = 5; 

        const seq = [
            startA, 
            startB, 
            startA + diffA, 
            startB - diffB, 
            startA + diffA*2
        ];

        return {
            sequence: seq,
            next: startB - diffB*2,
            hint: "Hai quy luật đan xen nhau (vị trí chẵn/lẻ).",
            points: 600
        };
    },

    // 5. SIÊU TRÍ TUỆ: Logic chữ số (Cấp 16+)
    generateDigitalSum: (level) => {
        const start = Math.floor(Math.random() * 3) + 1;
        const logic = (n) => (n*n) + n; 
        
        const seq = [logic(start), logic(start+1), logic(start+2), logic(start+3)];
        
        return {
            sequence: seq,
            next: logic(start+4),
            hint: "Quy luật: n² + n (Hoặc khoảng cách tăng dần chẵn).",
            points: 800
        };
    }
};

function generateNewLevel() {
    const level = gameState.level;
    let data;

    if (level <= 3) data = LevelGenerator.generateArithmetic(level);
    else if (level <= 6) data = LevelGenerator.generateGeometric(level);
    else if (level <= 10) data = LevelGenerator.generateFibonacci(level);
    else if (level <= 15) data = LevelGenerator.generateInterleaved(level);
    else data = LevelGenerator.generateDigitalSum(level); 

    gameState.currentSequence = data;
    renderGame(data);
}

function renderGame(data) {
    const container = document.getElementById('sequence-container');
    const levelIndicator = document.getElementById('level-indicator');
    const inputEl = document.getElementById('rule-input');
    
    if(levelIndicator) levelIndicator.innerText = `Protocol Level: ${gameState.level}`;
    if(inputEl) { inputEl.value = ''; inputEl.focus(); }

    if(container) {
        container.innerHTML = '';
        data.sequence.forEach((num, idx) => {
            container.insertAdjacentHTML('beforeend', `
                <div class="group relative animate-fade-in" style="animation-delay: ${idx * 100}ms">
                    <div class="w-16 h-20 md:w-20 md:h-24 bg-background-dark border border-primary/40 rounded-lg flex items-center justify-center relative overflow-hidden shadow-[0_0_10px_rgba(37,140,244,0.15)] group-hover:shadow-neon group-hover:border-primary transition-all duration-300">
                        <span class="text-3xl md:text-4xl font-bold text-white group-hover:text-primary transition-colors">${num}</span>
                    </div>
                    <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-primary/40 uppercase tracking-widest">idx_${idx}</span>
                </div>
                <div class="hidden md:block h-px w-8 bg-primary/20 flex-1 mx-2 relative shrink-0"><div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40"></div></div>
            `);
        });
        
        container.insertAdjacentHTML('beforeend', `
            <div class="relative animate-pulse" id="target-block">
                <div class="w-16 h-20 md:w-20 md:h-24 bg-primary/10 border-2 border-dashed border-primary/60 rounded-lg flex items-center justify-center relative overflow-hidden shadow-neon">
                    <span class="text-3xl md:text-4xl font-bold text-primary">?</span>
                </div>
                <span class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-primary font-bold uppercase tracking-widest">Target</span>
            </div>
        `);
    }
    
    const complexity = gameState.level > 10 ? 'EXTREME' : (gameState.level > 5 ? 'HIGH' : 'NORMAL');
    addLogEntry('System', `Sequence generated. Complexity: ${complexity}.`, 'info');
}

async function checkAnswer() {
    const inputEl = document.getElementById('rule-input');
    const userVal = parseInt(inputEl.value);
    const targetVal = gameState.currentSequence.next;

    if (isNaN(userVal)) {
        addLogEntry('Error', 'Invalid data input.', 'error');
        shakeElement(inputEl);
        return;
    }

    if (userVal === targetVal) {
        // --- VICTORY (TRẢ LỜI ĐÚNG) ---
        addLogEntry('Success', `Calculation Correct. Target: ${userVal}`, 'success');
        
        const targetBlock = document.getElementById('target-block');
        if(targetBlock) {
            targetBlock.classList.remove('animate-pulse');
            targetBlock.innerHTML = `<div class="w-16 h-20 md:w-20 md:h-24 bg-primary border-2 border-primary rounded-lg flex items-center justify-center shadow-neon-intense"><span class="text-3xl md:text-4xl font-bold text-white">${userVal}</span></div>`;
        }

        // Tính toán phần thưởng
        const pointsEarned = gameState.currentSequence.points;
        const coinsEarned = Math.floor(pointsEarned / 10); // 10% điểm thành coin
        const expEarned = Math.floor(pointsEarned / 5);   // 20% điểm thành exp

        gameState.score += pointsEarned;
        gameState.level++; 
        updateScoreUI();

        // --- GỌI API CỘNG THƯỞNG (COIN + EXP + PLAY COUNT) ---
        await sendReward(coinsEarned, expEarned);

        setTimeout(() => {
            generateNewLevel();
        }, 1000);

    } else {
        // --- DEFEAT (THUA CUỘC) ---
        shakeElement(inputEl);
        
        // --- GỌI API LƯU KỶ LỤC (HIGH SCORE) ---
        await saveHighScore(gameState.score);

        // Chuyển trang Game Over
        setTimeout(() => {
            window.location.href = 'sequence_gameover.html'; 
        }, 800);
    }
}

// --- CÁC HÀM GỌI API SERVER (MỚI THÊM) ---

async function sendReward(coins, exp) {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
        await fetch('http://localhost:3000/api/user/reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                coins: coins,
                exp: exp,
                game: 'sequence' // <--- QUAN TRỌNG: Để server đếm số lần chơi
            })
        });
        console.log(`[Server] Reward sent: +${coins} Coins, +${exp} EXP`);
    } catch (err) {
        console.error("Lỗi gửi thưởng:", err);
    }
}

async function saveHighScore(score) {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
        await fetch('http://localhost:3000/api/user/highscore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                game: 'sequence', // Key phải khớp với server
                score: score
            })
        });
        console.log(`[Server] Highscore saved: ${score}`);
    } catch (err) {
        console.error("Lỗi lưu điểm:", err);
    }
}

function showHint() {
    if (gameState.score >= GameConfig.hintCost) {
        gameState.score -= GameConfig.hintCost;
        updateScoreUI();
        addLogEntry('Hint', gameState.currentSequence.hint, 'hint');
    } else {
        addLogEntry('Warning', `Insufficient data. Need ${GameConfig.hintCost} PTS.`, 'error');
        shakeElement(document.getElementById('score-display'));
    }
}

// --- TIỆN ÍCH ---
function addLogEntry(title, message, type) {
    const logContainer = document.getElementById('lab-notes-content');
    if(!logContainer) return;
    const colors = type === 'error' ? 'border-red-500 bg-red-500/10 text-red-400' : (type === 'success' ? 'border-primary bg-primary/10 text-primary' : (type === 'hint' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-600 bg-slate-800/50 text-slate-400'));
    logContainer.insertAdjacentHTML('afterbegin', `<div class="${colors.split(' ').slice(0,2).join(' ')} border-l-2 p-3 rounded-r-lg mb-3 animate-fade-in-up"><div class="flex justify-between items-start mb-1"><span class="text-[10px] ${colors.split(' ')[2]} font-bold uppercase">${title}</span><span class="text-[10px] text-slate-500">NOW</span></div><div class="text-xs text-slate-300">${message}</div></div>`);
}

function updateScoreUI() { const s = document.getElementById('score-display'); if(s) s.innerText = `PTS: ${gameState.score}`; }
function shakeElement(e) { if(e) { e.classList.add('animate-shake'); setTimeout(() => e.classList.remove('animate-shake'), 500); } }