/* file: public/js/chess.js */

const TARGET_SUM = 260; 
const SIZE = 8; 

let board = [];       
let path = [];        
let startCell = null;
let endCell = null;
let currentCell = null;
let validMoves = [];

let timerInterval = null;
let secondsElapsed = 0;
let gameStarted = false;
let pendingMove = null; 

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    bindInputEvents();
});

function initGame() {
    const targetDisplay = document.getElementById('target-display');
    if(targetDisplay) targetDisplay.innerText = TARGET_SUM;
    
    generateLevel();
    renderBoard();
    updateUI();
}

function generateLevel() {
    let success = false;
    let generatedPath = [];
    
    while (!success) {
        let visited = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));
        let sr = Math.floor(Math.random() * SIZE);
        let sc = Math.floor(Math.random() * SIZE);
        generatedPath = [[sr, sc]];
        visited[sr][sc] = true;

        let r = sr, c = sc;
        let deadEnd = false;

        for (let i = 1; i < 64; i++) {
            let moves = getKnightMoves(r, c).filter(m => !visited[m.r][m.c]);
            if (moves.length === 0) {
                deadEnd = true; break;
            }
            moves.sort((a, b) => {
                return getKnightMoves(a.r, a.c).filter(m => !visited[m.r][m.c]).length 
                     - getKnightMoves(b.r, b.c).filter(m => !visited[m.r][m.c]).length;
            });
            
            r = moves[0].r; c = moves[0].c;
            generatedPath.push([r, c]);
            visited[r][c] = true;
        }
        if (!deadEnd) success = true;
    }

    board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null).map(() => ({
        val: null, visited: false, isStart: false, isEnd: false
    })));

    startCell = { r: generatedPath[0][0], c: generatedPath[0][1] };
    endCell = { r: generatedPath[63][0], c: generatedPath[63][1] };

    board[startCell.r][startCell.c].isStart = true;
    board[endCell.r][endCell.c].isEnd = true;
    
    validMoves = [startCell]; 
}

function getKnightMoves(r, c) {
    const moves = [
        [-2,-1], [-2,1], [-1,-2], [-1,2],
        [1,-2], [1,2], [2,-1], [2,1]
    ];
    return moves.map(m => ({r: r + m[0], c: c + m[1]}))
                .filter(m => m.r >= 0 && m.r < SIZE && m.c >= 0 && m.c < SIZE);
}

// Render lưới và các ô cờ
function renderBoard() {
    const boardEl = document.getElementById('chessboard');
    if(!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            // Class base dựa trên UI gốc
            cell.className = 'border border-slate-300 flex items-center justify-center text-slate-500 font-medium text-lg relative board-cell bg-white';
            
            const data = board[r][c];
            
            if (data.isStart) cell.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
            if (data.isEnd) cell.classList.add('bg-red-50', 'dark:bg-red-900/20');

            if (data.visited) {
                cell.innerText = data.val;
                cell.classList.remove('bg-white', 'text-slate-500');
                cell.classList.add('bg-primary/10', 'text-slate-900');
            }

            // Vẽ Icon (Chuột/Mã) giống UI gốc
            if (currentCell && currentCell.r === r && currentCell.c === c) {
                cell.innerHTML = `
                    ${data.val || ''}
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="size-8 border-2 border-primary rotate-45 flex items-center justify-center bg-white shadow-sm z-10">
                            <div class="size-2 bg-primary rounded-full"></div>
                        </div>
                    </div>
                `;
            }

            if (validMoves.some(m => m.r === r && m.c === c)) {
                cell.classList.add('valid-move');
                cell.onclick = () => handleCellClick(r, c);
            }

            if (data.isStart && !data.visited) cell.innerHTML += '<span class="absolute bottom-1 text-[9px] text-blue-500 font-bold uppercase tracking-widest">Start</span>';
            if (data.isEnd && !data.visited) cell.innerHTML += '<span class="absolute bottom-1 text-[9px] text-red-500 font-bold uppercase tracking-widest">End</span>';

            boardEl.appendChild(cell);
        }
    }
}

function updateUI() {
    const topSumsEl = document.getElementById('top-sums');
    const leftSumsEl = document.getElementById('left-sums');
    
    topSumsEl.innerHTML = '';
    leftSumsEl.innerHTML = '';

    let colSums = Array(SIZE).fill(0);
    let rowSums = Array(SIZE).fill(0);

    for (let r=0; r<SIZE; r++) {
        for (let c=0; c<SIZE; c++) {
            let val = board[r][c].val || 0;
            rowSums[r] += val;
            colSums[c] += val;
        }
    }

    for (let c=0; c<SIZE; c++) {
        let div = document.createElement('div');
        let isMatch = colSums[c] === TARGET_SUM && colSums[c] !== 0;
        div.className = `text-center font-bold text-lg ${isMatch ? 'text-emerald-600' : 'text-slate-900'}`;
        div.innerText = colSums[c] || '';
        topSumsEl.appendChild(div);
    }

    for (let r=0; r<SIZE; r++) {
        let div = document.createElement('div');
        let isMatch = rowSums[r] === TARGET_SUM && rowSums[r] !== 0;
        div.className = `flex items-center justify-end font-bold text-lg w-10 ${isMatch ? 'text-emerald-600' : 'text-slate-900'}`;
        div.innerText = rowSums[r] || '';
        leftSumsEl.appendChild(div);
    }
}

function handleCellClick(r, c) {
    pendingMove = {r, c};
    const overlay = document.getElementById('input-overlay');
    const input = document.getElementById('cell-input');
    
    overlay.classList.remove('hidden');
    input.value = '';
    setTimeout(() => input.focus(), 50);
}

function bindInputEvents() {
    const input = document.getElementById('cell-input');
    const btn = document.getElementById('btn-submit-val');
    if(!input || !btn) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitMove();
    });
    btn.onclick = () => submitMove();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('input-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                overlay.classList.add('hidden'); 
            } else {
                window.undoMove(); 
            }
        }
    });
}

function submitMove() {
    const valStr = document.getElementById('cell-input').value;
    const val = parseInt(valStr);

    if (isNaN(val)) return alert("Vui lòng nhập một số hợp lệ!");

    document.getElementById('input-overlay').classList.add('hidden');
    executeMove(pendingMove.r, pendingMove.c, val);
}

function executeMove(r, c, val) {
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    board[r][c].visited = true;
    board[r][c].val = val;
    currentCell = {r, c};
    path.push({r, c, val});

    updateValidMoves();
    renderBoard();
    updateUI();
    checkWinCondition();
}

function updateValidMoves() {
    if (!currentCell) return;
    validMoves = getKnightMoves(currentCell.r, currentCell.c).filter(m => !board[m.r][m.c].visited);
}

window.undoMove = function() {
    if (path.length === 0) return;
    
    const lastMove = path.pop();
    board[lastMove.r][lastMove.c].visited = false;
    board[lastMove.r][lastMove.c].val = null;

    if (path.length > 0) {
        const prevMove = path[path.length - 1];
        currentCell = { r: prevMove.r, c: prevMove.c };
        updateValidMoves();
    } else {
        currentCell = null;
        validMoves = [startCell];
        gameStarted = false;
        clearInterval(timerInterval);
        document.getElementById('game-timer').innerText = "00:00";
        secondsElapsed = 0;
    }

    renderBoard();
    updateUI();
}

window.resetGame = function() {
    if(confirm("Bạn có chắc muốn chơi lại từ đầu?")) {
        clearInterval(timerInterval);
        secondsElapsed = 0;
        document.getElementById('game-timer').innerText = "00:00";
        gameStarted = false;
        path = [];
        currentCell = null;
        initGame(); 
    }
}

function checkWinCondition() {
    if (path.length < 64) return;
    if (currentCell.r !== endCell.r || currentCell.c !== endCell.c) return;

    let rowSums = Array(SIZE).fill(0);
    let colSums = Array(SIZE).fill(0);
    for (let r=0; r<SIZE; r++) {
        for (let c=0; c<SIZE; c++) {
            rowSums[r] += board[r][c].val;
            colSums[c] += board[r][c].val;
        }
    }

    const isMathValid = rowSums.every(s => s === TARGET_SUM) && colSums.every(s => s === TARGET_SUM);

    if (isMathValid) {
        clearInterval(timerInterval);
        localStorage.setItem('chess_time_elapsed', secondsElapsed);
        window.location.href = 'chess_gameover.html'; 
    } else {
        alert("Bạn đã đi hết bàn cờ, nhưng tổng các hàng/cột chưa bằng " + TARGET_SUM + ". Vui lòng Undo và thử lại các con số!");
    }
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