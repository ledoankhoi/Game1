/* file: public/js/games/chess.js */

let TARGET_SUM = 200; 
const SIZE = 8; 

let board = [];       
let path = [];        
let correctPath = []; 
let correctGrid = []; 

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
    generateHiddenSolution(); 
    document.getElementById('target-display').innerText = TARGET_SUM;
    
    generateLevel();          
    renderBoard();
    updateUI();
}

function generateHiddenSolution() {
    let baseVal = Math.floor(Math.random() * 25) + 15; 
    TARGET_SUM = baseVal * 8; 
    correctGrid = Array(SIZE).fill(0).map(() => Array(SIZE).fill(baseVal));
    
    for(let i=0; i<300; i++) {
        let r1 = Math.floor(Math.random()*SIZE);
        let r2 = Math.floor(Math.random()*SIZE);
        let c1 = Math.floor(Math.random()*SIZE);
        let c2 = Math.floor(Math.random()*SIZE);
        let v = Math.floor(Math.random()*10) + 1; 
        
        if(r1 !== r2 && c1 !== c2) {
            if(correctGrid[r1][c2] - v > 0 && correctGrid[r2][c1] - v > 0) {
                correctGrid[r1][c1] += v;
                correctGrid[r2][c2] += v;
                correctGrid[r1][c2] -= v;
                correctGrid[r2][c1] -= v;
            }
        }
    }
}

function generateLevel() {
    let success = false;
    while (!success) {
        let visited = Array(SIZE).fill(0).map(() => Array(SIZE).fill(false));
        let sr = Math.floor(Math.random() * SIZE);
        let sc = Math.floor(Math.random() * SIZE);
        correctPath = [[sr, sc]];
        visited[sr][sc] = true;

        let r = sr, c = sc;
        let deadEnd = false;

        for (let i = 1; i < 64; i++) {
            let moves = getKnightMoves(r, c).filter(m => !visited[m.r][m.c]);
            if (moves.length === 0) { deadEnd = true; break; }
            moves.sort((a, b) => {
                return getKnightMoves(a.r, a.c).filter(m => !visited[m.r][m.c]).length 
                     - getKnightMoves(b.r, b.c).filter(m => !visited[m.r][m.c]).length;
            });
            r = moves[0].r; c = moves[0].c;
            correctPath.push([r, c]);
            visited[r][c] = true;
        }
        if (!deadEnd) success = true;
    }

    board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null).map(() => ({
        val: null, visited: false, isStart: false, isEnd: false
    })));

    startCell = { r: correctPath[0][0], c: correctPath[0][1] };
    endCell = { r: correctPath[63][0], c: correctPath[63][1] };

    board[startCell.r][startCell.c].isStart = true;
    board[endCell.r][endCell.c].isEnd = true;
    
    currentCell = null;
    validMoves = [startCell]; 
}

function getKnightMoves(r, c) {
    const moves = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
    return moves.map(m => ({r: r + m[0], c: c + m[1]})).filter(m => m.r >= 0 && m.r < SIZE && m.c >= 0 && m.c < SIZE);
}

function renderBoard() {
    const boardEl = document.getElementById('chessboard');
    if(!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            const isDark = (r + c) % 2 !== 0;
            const baseColor = isDark ? 'bg-[#3b4759]' : 'bg-[#e2e8f0]'; 
            const textColor = isDark ? 'text-gray-300' : 'text-gray-500';
            
            cell.className = `flex items-center justify-center font-bold text-2xl relative board-cell ${baseColor} ${textColor}`;
            const data = board[r][c];

            const rank = 8 - r;
            const file = String.fromCharCode(97 + c);
            
            if (c === 0) cell.innerHTML += `<span class="absolute top-1 left-1.5 text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} leading-none pointer-events-none">${rank}</span>`;
            if (r === 7) cell.innerHTML += `<span class="absolute bottom-1 right-1.5 text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'} leading-none pointer-events-none">${file}</span>`;

            if (data.visited) {
                cell.innerHTML += `<span class="${isDark ? 'text-white' : 'text-black'} z-10">${data.val}</span>`;
                cell.innerHTML += `<div class="absolute inset-0 bg-blue-500/${isDark ? '20' : '30'} pointer-events-none"></div>`;
            }

            if (currentCell && currentCell.r === r && currentCell.c === c) {
                cell.innerHTML += `
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="size-12 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.8)] z-20 animate-pulse">
                            <svg fill="#fff" viewBox="0 0 320 512" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                                <path d="M311.6 153.1c-13.4-18.4-38.4-23.7-57.1-11.4L192 186.2l-37.4-60.8c-5.5-9-15.5-14.4-26-14.2-22.1 .5-41.9 14.7-49.3 35.5L50.4 233.1C35.2 276.5 49 324.9 84.7 353.6l19.6 15.8c-1.3 6.6-2.3 13.4-2.3 20.6v8H64c-17.7 0-32 14.3-32 32v64h256v-64c0-17.7-14.3-32-32-32h-38v-8c0-10.4-1.8-20.3-4.7-29.7l62.2-25.2c27-10.9 44.5-36.9 44.5-66.1v-36c0-11-4.2-21.6-11.7-29.6l-6.7-7 19.3-13.2c16.5-11.3 20.6-34 9.2-50.6zM208 112c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z"/>
                            </svg>
                        </div>
                    </div>
                `;
            }

            if (validMoves.some(m => m.r === r && m.c === c)) {
                cell.classList.add('valid-move');
                cell.onclick = () => handleCellClick(r, c);
            }

            if (data.isStart && !data.visited) cell.innerHTML += `<span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-blue-500 font-black uppercase tracking-widest pointer-events-none drop-shadow-md">START</span>`;
            if (data.isEnd && !data.visited) cell.innerHTML += `<span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-red-500 font-black uppercase tracking-widest pointer-events-none drop-shadow-md">END</span>`;

            boardEl.appendChild(cell);
        }
    }
}

function updateUI() {
    const topSumsEl = document.getElementById('top-sums');
    const leftSumsEl = document.getElementById('left-sums');
    if (topSumsEl) topSumsEl.innerHTML = ''; 
    if (leftSumsEl) leftSumsEl.innerHTML = '';

    let colSums = Array(SIZE).fill(0), rowSums = Array(SIZE).fill(0);
    for (let r=0; r<SIZE; r++) {
        for (let c=0; c<SIZE; c++) {
            let val = board[r][c].val || 0;
            rowSums[r] += val; colSums[c] += val;
        }
    }

    for (let i=0; i<SIZE; i++) {
        if (topSumsEl) {
            let div = document.createElement('div');
            div.className = `text-center font-bold text-lg ${colSums[i] === TARGET_SUM ? 'text-primary' : 'text-gray-500'}`;
            div.innerText = colSums[i] || '-';
            topSumsEl.appendChild(div);
        }
        if (leftSumsEl) {
            let div = document.createElement('div');
            div.className = `flex items-center justify-end font-bold text-lg pr-4 ${rowSums[i] === TARGET_SUM ? 'text-primary' : 'text-gray-500'}`;
            div.innerText = rowSums[i] || '-';
            leftSumsEl.appendChild(div);
        }
    }

    // Cập nhật điểm lên Header hệ thống
    const headerScore = document.getElementById('current-score');
    if(headerScore) headerScore.innerText = currentScore.toLocaleString();
    
    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.innerText = `${path.length}/64`;
}

function handleCellClick(r, c) {
    pendingMove = {r, c};
    const overlay = document.getElementById('input-overlay');
    const input = document.getElementById('cell-input');
    overlay.classList.remove('hidden');
    input.value = '';
    setTimeout(() => { input.focus(); }, 50);
}

function bindInputEvents() {
    const input = document.getElementById('cell-input');
    const btn = document.getElementById('btn-submit-val');
    
    if (btn) btn.onclick = (e) => { e.preventDefault(); submitMove(); };

    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('input-overlay');
        const isOverlayOpen = overlay && !overlay.classList.contains('hidden');

        if (isOverlayOpen) {
            if (e.key === 'Enter') { e.preventDefault(); submitMove(); } 
            else if (e.key === 'Escape') { e.preventDefault(); overlay.classList.add('hidden'); }
        } else {
            if (e.key === 'Escape') { e.preventDefault(); window.undoMove(); }
        }
    });
}

window.submitMove = function() {
    const input = document.getElementById('cell-input');
    if (!input || input.value.trim() === '') return alert("Vui lòng nhập một số hợp lệ!");
    const val = parseInt(input.value);
    if (isNaN(val)) return alert("Vui lòng nhập một số hợp lệ!");
    
    document.getElementById('input-overlay').classList.add('hidden');
    executeMove(pendingMove.r, pendingMove.c, val);
}

function executeMove(r, c, val) {
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
        document.getElementById('move-log').innerHTML = ''; 
    }

    board[r][c].visited = true; 
    board[r][c].val = val;
    currentCell = {r, c}; 
    path.push({r, c, val});

    const log = document.getElementById('move-log');
    const rank = 8 - r;
    const file = String.fromCharCode(97 + c).toUpperCase();
    
    log.innerHTML += `
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 mb-2">
            <div class="flex items-center gap-3">
                <span class="font-black text-gray-500 w-6 text-right">${path.length}.</span>
                <span class="text-sm font-bold text-primary">Nước đi: ${file}${rank}</span>
            </div>
            <span class="text-sm font-black text-white px-3 py-1 bg-slate-900 rounded border border-slate-700">${val}</span>
        </div>
    `;
    log.scrollTop = log.scrollHeight;

    updateValidMoves(); 
    renderBoard(); 
    updateUI(); 
    checkWinCondition();
}

function updateValidMoves() {
    if (!currentCell) { validMoves = [startCell]; return; }
    validMoves = getKnightMoves(currentCell.r, currentCell.c).filter(m => !board[m.r][m.c].visited);
}

window.undoMove = function() {
    if (path.length === 0) return;
    
    const lastMove = path.pop();
    board[lastMove.r][lastMove.c].visited = false; 
    board[lastMove.r][lastMove.c].val = null;
    
    if (path.length > 0) {
        currentCell = { r: path[path.length - 1].r, c: path[path.length - 1].c };
        updateValidMoves();
    } else {
        currentCell = null;
        validMoves = [startCell];
        gameStarted = false;
        clearInterval(timerInterval);
        document.getElementById('game-timer').innerText = "00:00";
        secondsElapsed = 0;
        document.getElementById('move-log').innerHTML = '<div class="text-center text-sm text-gray-500 mt-4 italic">Hãy chọn ô START để bắt đầu...</div>';
    }
    
    const log = document.getElementById('move-log');
    if (log.lastElementChild && path.length > 0) log.removeChild(log.lastElementChild);
    
    renderBoard(); updateUI();
}

// HÀM CHỊU THUA ĐÃ ĐƯỢC THÊM LOG ĐỂ KIỂM TRA
window.surrenderGame = function() {
    console.log("[HỆ THỐNG] Đã nhấn nút Chịu Thua!");
    if(confirm("Bạn chịu thua? Trò chơi sẽ kết thúc và hiển thị đáp án đúng!")) {
        endGame(false);
    }
}

function checkWinCondition() {
    if (path.length < 64) return;
    if (currentCell.r !== endCell.r || currentCell.c !== endCell.c) return;

    let rowSums = Array(SIZE).fill(0), colSums = Array(SIZE).fill(0);
    for (let r=0; r<SIZE; r++) {
        for (let c=0; c<SIZE; c++) {
            rowSums[r] += board[r][c].val; colSums[c] += board[r][c].val;
        }
    }
    const isWin = rowSums.every(s => s === TARGET_SUM) && colSums.every(s => s === TARGET_SUM);

    if (isWin) endGame(true);
    else alert("Bàn cờ đã đầy nhưng tổng không bằng " + TARGET_SUM + ". Hãy Undo để sửa lại!");
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
async function endGame(isWin) {
    console.log("[HỆ THỐNG] Đang chạy kết thúc ván đấu. Thắng:", isWin);
    clearInterval(timerInterval);

    try {
        // 1. TÍNH ĐIỂM DỰA TRÊN CÁC BƯỚC ĐÃ ĐI
        let correctMovesCount = 0;
        path.forEach((pMove, i) => {
            const cMove = correctPath[i];
            if(pMove && cMove && pMove.r === cMove[0] && pMove.c === cMove[1]) {
                const solutionVal = correctGrid[cMove[0]][cMove[1]];
                if(pMove.val === solutionVal) correctMovesCount++;
            }
        });

        let baseScore = correctMovesCount * 50;
        let timePenalty = secondsElapsed * 2;
        let finalScore = Math.max(0, baseScore - timePenalty);
        if(isWin) finalScore += 5000;

        // 2. GỬI ĐIỂM VÀ NHẬN THƯỞNG TỪ SERVER
        if (typeof RewardManager !== 'undefined') {
            const reward = await RewardManager.submitScore('chess', finalScore);
            if (reward) {
                // Hiện khung thưởng và nạp số liệu
                const rewardContainer = document.getElementById('go-reward-container');
                const coinsEl = document.getElementById('go-earned-coins');
                const expEl = document.getElementById('go-earned-exp');
                
                if (rewardContainer) rewardContainer.classList.remove('hidden');
                if (coinsEl) coinsEl.innerText = `+${reward.coins}`;
                if (expEl) expEl.innerText = `+${reward.exp}`;
            }
        }

        // 3. CẬP NHẬT UI OVERLAY
        const title = document.getElementById('status-title');
        if (title) {
            title.innerText = isWin ? "MISSION ACCOMPLISHED" : "MISSION FAILED";
            title.className = `text-3xl font-black uppercase tracking-widest ${isWin ? 'text-emerald-500' : 'text-red-500'}`;
        }

        const scoreGo = document.getElementById('go-score-display');
        if (scoreGo) scoreGo.innerText = finalScore.toLocaleString();

        const targetSumEl = document.getElementById('go-target-sum-display');
        if (targetSumEl) targetSumEl.innerText = TARGET_SUM;

        // Vẽ bàn cờ đáp án (Post-Mortem)
        const boardEl = document.getElementById('correct-board');
        if (boardEl) {
            boardEl.innerHTML = '';
            for(let r=0; r<8; r++) {
                for(let c=0; c<8; c++) {
                    const cell = document.createElement('div');
                    const isDark = (r + c) % 2 !== 0;
                    cell.className = `flex items-center justify-center font-bold text-lg relative ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`;
                    cell.innerText = correctGrid[r][c];
                    
                    // Highlight start/end trên bàn cờ đáp án
                    if(r === correctPath[0][0] && c === correctPath[0][1]) cell.innerHTML += `<div class="absolute inset-0 border-2 border-blue-500 z-10"></div>`;
                    if(r === correctPath[63][0] && c === correctPath[63][1]) cell.innerHTML += `<div class="absolute inset-0 border-2 border-red-500 z-10"></div>`;
                    
                    boardEl.appendChild(cell);
                }
            }
        }

        // Vẽ danh sách Log nước đi đúng/sai (2 cột trái phải)
        const correctLog = document.getElementById('correct-log');
        const playerLog = document.getElementById('player-log');
        if (correctLog) correctLog.innerHTML = ''; 
        if (playerLog) playerLog.innerHTML = '';

        for(let i=0; i<64; i++) {
            const cMove = correctPath[i];
            const cVal = correctGrid[cMove[0]][cMove[1]];
            
            if (correctLog) {
                correctLog.innerHTML += `<div class="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-emerald-500/20 text-[10px]"><span class="text-gray-500">${i+1}.</span><span class="font-bold text-gray-300">R${cMove[0]+1}C${cMove[1]+1}</span><span class="font-black text-emerald-400">${cVal}</span></div>`;
            }

            if (playerLog) {
                const pMove = path[i];
                if(pMove) {
                    const isMatch = (pMove.r === cMove[0] && pMove.c === cMove[1] && pMove.val === cVal);
                    const border = isMatch ? 'border-emerald-500/50' : 'border-red-500/50';
                    const text = isMatch ? 'text-emerald-400' : 'text-red-400';
                    playerLog.innerHTML += `<div class="flex justify-between items-center bg-slate-800/50 p-2 rounded border ${border} text-[10px]"><span class="text-gray-500">${i+1}.</span><span class="font-bold text-gray-300">R${pMove.r+1}C${pMove.c+1}</span><span class="font-black ${text}">${pMove.val}</span></div>`;
                } else {
                    playerLog.innerHTML += `<div class="p-2 border border-white/5 opacity-20 text-[10px]">---</div>`;
                }
            }
        }

        // 4. HIỂN THỊ OVERLAY
        const overlay = document.getElementById('chess-gameover-overlay');
        const panel = document.getElementById('go-panel-scale');
        if (overlay && panel) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                panel.classList.remove('scale-95');
                panel.classList.add('scale-100');
            }, 50);
        }

    } catch (e) {
        console.error("Lỗi nghiêm trọng khi hiển thị kết quả:", e);
    }

}