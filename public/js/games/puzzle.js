/* file: public/js/games/puzzle.js */

const SIZE = 4;
let grid = [];
let score = 0;
let bestScore = 0;
let gameStarted = false;
let secondsElapsed = 0;
let timerInterval = null;
let moveCount = 0; // Đếm số bước đi

document.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    initGame();
    setupEventListeners();
});

function initGame() {
    grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    score = 0;
    moveCount = 0;
    secondsElapsed = 0;
    gameStarted = false;
    
    updateScoreUI();
    clearInterval(timerInterval);
    document.getElementById('game-timer').innerText = "00:00";
    
    // Clear log
    document.getElementById('move-log').innerHTML = '<div class="text-center text-sm text-slate-400 mt-4 italic">Hãy bắt đầu vuốt/nhấn phím...</div>';
    
    // Add two initial tiles
    addRandomTile();
    addRandomTile();
    renderGrid();
}

function loadBestScore() {
    bestScore = parseInt(localStorage.getItem('puzzle_best_score')) || 0;
    document.getElementById('best-score').innerText = bestScore;
}

function updateScoreUI() {
    document.getElementById('current-score').innerText = score;
    if (score > bestScore) {
        bestScore = score;
        document.getElementById('best-score').innerText = bestScore;
        localStorage.setItem('puzzle_best_score', bestScore);
    }
}

function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderGrid() {
    const gridEl = document.getElementById('puzzle-grid');
    gridEl.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'bg-slate-300 dark:bg-slate-700 rounded-lg flex items-center justify-center shadow-inner';
            
            const value = grid[r][c];
            if (value > 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${value} shadow-md`;
                tile.innerText = value;
                cell.appendChild(tile);
            } else {
                cell.classList.add('tile-empty');
            }
            gridEl.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.getElementById('reset-btn').addEventListener('click', () => {
        if(confirm("Xác nhận chơi lại từ đầu? Mọi điểm số hiện tại sẽ bị hủy.")) {
            initGame();
        }
    });

    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) move(dx > 0 ? 'right' : 'left');
        } else {
            if (Math.abs(dy) > 30) move(dy > 0 ? 'down' : 'up');
        }
    }, { passive: true });
}

function handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        move(direction);
    }
}

function logMove(direction, gainedScore) {
    moveCount++;
    const logEl = document.getElementById('move-log');
    
    // Nếu là bước đi đầu tiên thì xóa dòng "Hãy bắt đầu..."
    if (moveCount === 1) {
        logEl.innerHTML = '';
    }

    const dirMap = {
        'up': { icon: 'arrow_upward', text: 'Trượt Lên' },
        'down': { icon: 'arrow_downward', text: 'Trượt Xuống' },
        'left': { icon: 'arrow_back', text: 'Trượt Trái' },
        'right': { icon: 'arrow_forward', text: 'Trượt Phải' }
    };

    const moveInfo = dirMap[direction];
    
    // Hiển thị điểm cộng nếu có gộp số
    const gainedHtml = gainedScore > 0 
        ? `<span class="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">+${gainedScore}</span>` 
        : `<span class="text-xs font-bold text-slate-400 px-2 py-1">0</span>`;

    logEl.innerHTML += `
        <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-3">
                <span class="font-black text-slate-400 dark:text-slate-500 w-6 text-right">${moveCount}.</span>
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-primary">${moveInfo.icon}</span>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${moveInfo.text}</span>
                </div>
            </div>
            ${gainedHtml}
        </div>
    `;
    
    // Tự động cuộn xuống dưới cùng
    logEl.scrollTop = logEl.scrollHeight;
}

function move(direction) {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    let moved = false;
    let oldScore = score;

    if (direction === 'up') moved = moveUp();
    if (direction === 'down') moved = moveDown();
    if (direction === 'left') moved = moveLeft();
    if (direction === 'right') moved = moveRight();

    if (moved) {
        let gainedScore = score - oldScore; // Tính số điểm kiếm được ở lượt này
        logMove(direction, gainedScore); // Gọi hàm log

        addRandomTile();
        renderGrid();
        updateScoreUI();
        
        if (checkWin()) {
            clearInterval(timerInterval);
            document.getElementById('modal-victory').classList.remove('hidden');
        } else if (isGameOver()) {
            clearInterval(timerInterval);
            localStorage.setItem('puzzle_last_score', score);
            window.location.href = 'puzzle_gameover.html';
        }
    }
}

function slide(row) {
    const arr = row.filter(val => val !== 0);
    const missing = SIZE - arr.length;
    const zeros = Array(missing).fill(0);
    return arr.concat(zeros);
}

function combine(row) {
    for (let i = 0; i < SIZE - 1; i++) {
        if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
        }
    }
    return row;
}

function moveLeft() {
    let moved = false;
    for (let r = 0; r < SIZE; r++) {
        const oldRow = [...grid[r]];
        let row = slide(grid[r]);
        row = combine(row);
        row = slide(row);
        grid[r] = row;
        if (JSON.stringify(oldRow) !== JSON.stringify(row)) moved = true;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let r = 0; r < SIZE; r++) {
        const oldRow = [...grid[r]];
        let row = grid[r].reverse();
        row = slide(row);
        row = combine(row);
        row = slide(row);
        grid[r] = row.reverse();
        if (JSON.stringify(oldRow) !== JSON.stringify(grid[r])) moved = true;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let c = 0; c < SIZE; c++) {
        const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
        const oldCol = [...col];
        let row = slide(col);
        row = combine(row);
        row = slide(row);
        for (let r = 0; r < SIZE; r++) grid[r][c] = row[r];
        if (JSON.stringify(oldCol) !== JSON.stringify(row)) moved = true;
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let c = 0; c < SIZE; c++) {
        const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]].reverse();
        const oldCol = [...col];
        let row = slide(col);
        row = combine(row);
        row = slide(row);
        row.reverse();
        for (let r = 0; r < SIZE; r++) grid[r][c] = row[r];
        if (JSON.stringify(oldCol) !== JSON.stringify(row.reverse())) moved = true;
    }
    return moved;
}

function checkWin() {
    // 2048 cổ điển sẽ báo win khi đạt mốc 2048
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 2048) return true;
        }
    }
    return false;
}

function isGameOver() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return false;
            if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
            if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
        }
    }
    return true;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const s = (secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('game-timer').innerText = `${m}:${s}`;
    }, 1000);
}