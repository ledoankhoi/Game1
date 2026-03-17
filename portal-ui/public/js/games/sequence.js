/**
 * SEQUENCE.JS - GENIUS EDITION (Integrated with RewardManager)
 */

const GameConfig = {
    baseScore: 100,
    scoreMultiplier: 1.2, 
    hintCost: 50
};

let gameState = {
    level: 1,
    score: 0,
    currentSequence: null 
};

document.addEventListener('DOMContentLoaded', () => { initGame(); });

function initGame() {
    console.log("Neon Lab: GENIUS CORE ACTIVATED");
    gameState.score = 0;
    gameState.level = 1;

    generateNewLevel();
    updateScoreUI();

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
    
    const btnClearLog = document.getElementById('btn-clear-log');
    if(btnClearLog) {
        btnClearLog.addEventListener('click', () => {
            const logContainer = document.getElementById('lab-notes-content');
            if(logContainer) logContainer.innerHTML = '';
        });
    }

    const inputElement = document.getElementById('rule-input');
    if(inputElement) {
        inputElement.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
        inputElement.addEventListener('keydown', (e) => {
            if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
        });
    }
}

// BỘ TẠO THUẬT TOÁN (Giữ nguyên siêu cấp trí tuệ của bạn)
const LevelGenerator = {
    generateArithmetic: (level) => {
        const start = Math.floor(Math.random() * 50);
        const diff = Math.floor(Math.random() * 10) + 2; 
        const seq = [start, start + diff, start + diff*2, start + diff*3];
        return { sequence: seq, next: start + diff*4, hint: `Cấp số cộng: Tăng đều ${diff} đơn vị.`, points: 100 };
    },
    generateGeometric: (level) => {
        const start = Math.floor(Math.random() * 5) + 2;
        const ratio = Math.floor(Math.random() * 2) + 2; 
        const seq = [start, start * ratio, start * ratio*ratio, start * ratio*ratio*ratio];
        return { sequence: seq, next: start * Math.pow(ratio, 4), hint: `Cấp số nhân: Gấp ${ratio} lần số trước.`, points: 200 };
    },
    generateFibonacci: (level) => {
        const type = Math.random() > 0.5 ? 'fib' : 'tri';
        if (type === 'fib') {
            let a = Math.floor(Math.random() * 5) + 1, b = Math.floor(Math.random() * 5) + 1;
            return { sequence: [a, b, a+b, a+b+b], next: (a+b) + (a+b+b), hint: "Tổng hai số liền trước.", points: 300 };
        } else {
            let a=1, b=1, c=2;
            return { sequence: [a, b, c, a+b+c], next: b + c + (a+b+c), hint: "Tổng ba số liền trước (Tribonacci).", points: 400 };
        }
    },
    generateInterleaved: (level) => {
        const startA = Math.floor(Math.random() * 10), diffA = 2; 
        const startB = Math.floor(Math.random() * 50) + 50, diffB = 5; 
        return { sequence: [startA, startB, startA + diffA, startB - diffB, startA + diffA*2], next: startB - diffB*2, hint: "Hai quy luật đan xen nhau.", points: 600 };
    },
    generateDigitalSum: (level) => {
        const start = Math.floor(Math.random() * 3) + 1;
        const logic = (n) => (n*n) + n; 
        return { sequence: [logic(start), logic(start+1), logic(start+2), logic(start+3)], next: logic(start+4), hint: "Quy luật: n² + n.", points: 800 };
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
    
    if(levelIndicator) levelIndicator.innerText = `Level ${gameState.level}`;
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
        // --- TRẢ LỜI ĐÚNG ---
        addLogEntry('Success', `Calculation Correct. Added ${gameState.currentSequence.points} PTS.`, 'success');
        
        const targetBlock = document.getElementById('target-block');
        if(targetBlock) {
            targetBlock.classList.remove('animate-pulse');
            targetBlock.innerHTML = `<div class="w-16 h-20 md:w-20 md:h-24 bg-primary border-2 border-primary rounded-lg flex items-center justify-center shadow-neon-intense"><span class="text-3xl md:text-4xl font-bold text-white">${userVal}</span></div>`;
        }

        gameState.score += gameState.currentSequence.points;
        gameState.level++; 
        updateScoreUI();

        setTimeout(() => { generateNewLevel(); }, 1000);

    } else {
        // --- THUA CUỘC ---
        shakeElement(inputEl);
        
        // 1. Gửi TỔNG ĐIỂM lên Server qua RewardManager
        if (typeof RewardManager !== 'undefined' && typeof RewardManager.submitScore === 'function') {
            const reward = await RewardManager.submitScore('sequence', gameState.score);
            if (reward) {
                document.getElementById('go-reward-container').classList.remove('hidden');
                document.getElementById('go-earned-coins').innerText = '+' + reward.coins;
                document.getElementById('go-earned-exp').innerText = '+' + reward.exp;
            }
        }

        // 2. Điền số liệu vào màn hình Overlay
        document.getElementById('correct-answer-display').innerText = targetVal;
        document.getElementById('fail-level-indicator').innerText = "Variant " + gameState.level + " Failed";
        
        // Chạy hiệu ứng số điểm
        animateValue("final-score-display", 0, gameState.score, 1000);

        // 3. Hiển thị Overlay
        setTimeout(() => {
            const overlay = document.getElementById('seq-gameover-overlay');
            const panel = document.getElementById('seq-gameover-panel');
            if(overlay && panel) {
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
                setTimeout(() => {
                    overlay.classList.remove('opacity-0');
                    panel.classList.remove('scale-95');
                    panel.classList.add('scale-100');
                }, 50);
            }
        }, 800);
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

function addLogEntry(title, message, type) {
    const logContainer = document.getElementById('lab-notes-content');
    if(!logContainer) return;
    const colors = type === 'error' ? 'border-red-500 bg-red-500/10 text-red-400' : (type === 'success' ? 'border-primary bg-primary/10 text-primary' : (type === 'hint' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-slate-600 bg-slate-800/50 text-slate-400'));
    logContainer.insertAdjacentHTML('afterbegin', `<div class="${colors.split(' ').slice(0,2).join(' ')} border-l-2 p-3 rounded-r-lg mb-3 animate-fade-in-up"><div class="flex justify-between items-start mb-1"><span class="text-[10px] ${colors.split(' ')[2]} font-bold uppercase">${title}</span></div><div class="text-xs text-slate-300">${message}</div></div>`);
}

function updateScoreUI() { 
    const s = document.getElementById('score-display'); 
    if(s) s.innerText = gameState.score.toLocaleString(); 
}

function shakeElement(e) { 
    if(e) { e.classList.add('animate-shake'); setTimeout(() => e.classList.remove('animate-shake'), 500); } 
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}