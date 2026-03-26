const BOARD_SIZE = 7;
const PLAYER_RED = 1; // Left to Right
const PLAYER_BLUE = 2; // Top to Bottom
const EMPTY = 0;
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, -1]];

let board = [];
let isAITurn = false;
let currentTurn = 1;

// --- Khởi tạo UI ---
const gridEl = document.getElementById('hex-grid');
const logEl = document.getElementById('tactical-log');
const statusEl = document.getElementById('ai-status');

function initGame() {
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(EMPTY));
    gridEl.style.setProperty('--board-size', BOARD_SIZE);
    gridEl.innerHTML = '';
    logEl.innerHTML = '';
    currentTurn = 1;
    isAITurn = false;
    updateHUD();

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'hex-cell bg-surface-container-high border-[0.5px] border-outline-variant/20 hover:bg-surface-bright hover:scale-105 transition-all cursor-pointer flex items-center justify-center';
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', () => handlePlayerMove(r, c));
            gridEl.appendChild(cell);
        }
    }
    addLog("SYSTEM", "Battlefield initialized. Red Player engages first.");
}

function updateCellUI(r, c, player) {
    const index = r * BOARD_SIZE + c;
    const cell = gridEl.children[index];
    if (player === PLAYER_RED) {
        cell.className = 'hex-cell bg-secondary-container/80 ring-2 ring-secondary hex-glow-red flex items-center justify-center';
        cell.innerHTML = '<span class="w-3 h-3 bg-secondary rounded-full shadow-[0_0_10px_#ff59e3]"></span>';
    } else {
        cell.className = 'hex-cell bg-primary-container/40 ring-2 ring-primary hex-glow-blue flex items-center justify-center';
        cell.innerHTML = '<span class="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#8ff5ff]"></span>';
    }
}

// --- Logic Trò Chơi ---
function handlePlayerMove(r, c) {
    if (isAITurn || board[r][c] !== EMPTY) return;
    
    if(typeof SoundManager !== 'undefined') SoundManager.play('click_test');
    board[r][c] = PLAYER_RED;
    updateCellUI(r, c, PLAYER_RED);
    addLog("RED", `Node encrypted at [${r}, ${c}]`, "text-secondary");
    
    if (checkWin(board, PLAYER_RED)) {
        endGame(PLAYER_RED);
        return;
    }

    isAITurn = true;
    currentTurn++;
    updateHUD();
    statusEl.innerText = "COMPUTING TACTICS...";
    statusEl.classList.replace('text-secondary', 'text-primary');

    // Cấp cho AI 600ms để chạy giả lập tương lai
    setTimeout(() => makeAIMove(), 50);
}

function makeAIMove() {
    const move = runMCTS(board, PLAYER_BLUE, 600); 
    board[move.r][move.c] = PLAYER_BLUE;
    updateCellUI(move.r, move.c, PLAYER_BLUE);
    addLog("BLUE", `Counter-measure deployed at [${move.r}, ${move.c}]`, "text-primary");

    if(typeof SoundManager !== 'undefined') SoundManager.play('click_test');

    if (checkWin(board, PLAYER_BLUE)) {
        endGame(PLAYER_BLUE);
        return;
    }

    isAITurn = false;
    currentTurn++;
    updateHUD();
    statusEl.innerText = "AWAITING MOVE";
    statusEl.classList.replace('text-primary', 'text-secondary');
}

// --- Thuật Toán Phân Giải (DFS) ---
function checkWin(gridState, player) {
    let visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
    let stack = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
        if (player === PLAYER_RED && gridState[i][0] === player) { stack.push({r: i, c: 0}); visited[i][0] = true; }
        if (player === PLAYER_BLUE && gridState[0][i] === player) { stack.push({r: 0, c: i}); visited[0][i] = true; }
    }

    while (stack.length > 0) {
        let curr = stack.pop();
        if (player === PLAYER_RED && curr.c === BOARD_SIZE - 1) return true;
        if (player === PLAYER_BLUE && curr.r === BOARD_SIZE - 1) return true;

        for (let dir of DIRECTIONS) {
            let nr = curr.r + dir[0], nc = curr.c + dir[1];
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited[nr][nc] && gridState[nr][nc] === player) {
                visited[nr][nc] = true;
                stack.push({r: nr, c: nc});
            }
        }
    }
    return false;
}

// --- AI MCTS Đơn Giản Hóa ---
function runMCTS(rootBoard, aiPlayer, maxTimeMs) {
    let legalMoves = [];
    for (let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) if(rootBoard[r][c]===EMPTY) legalMoves.push({r,c});
    
    if (legalMoves.length === 0) return null;
    
    let moveScores = new Array(legalMoves.length).fill(0);
    let endTime = performance.now() + maxTimeMs;
    let simulations = 0;

    // Phân bổ thời gian ngẫu nhiên (Monte Carlo) cho các nước đi
    while (performance.now() < endTime) {
        let moveIndex = Math.floor(Math.random() * legalMoves.length);
        let simBoard = rootBoard.map(row => [...row]);
        
        simBoard[legalMoves[moveIndex].r][legalMoves[moveIndex].c] = aiPlayer;
        let winner = simulateRandomGame(simBoard, aiPlayer === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED);
        
        if (winner === aiPlayer) moveScores[moveIndex]++;
        simulations++;
    }

    // Cập nhật thanh Xác suất (Thẩm mỹ UI)
    let bestScore = Math.max(...moveScores);
    let winProb = Math.min(95, Math.floor((bestScore / (simulations/legalMoves.length)) * 100));
    document.getElementById('prob-blue').innerText = winProb;
    document.getElementById('prob-red').innerText = 100 - winProb;
    document.getElementById('bar-blue').style.height = `${winProb}%`;
    document.getElementById('bar-red').style.height = `${100 - winProb}%`;

    let bestMoveIndex = moveScores.indexOf(bestScore);
    return legalMoves[bestMoveIndex];
}

function simulateRandomGame(simBoard, currentTurnPlayer) {
    let emptyCells = [];
    for (let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) if(simBoard[r][c]===EMPTY) emptyCells.push({r,c});
    
    emptyCells.sort(() => Math.random() - 0.5); // Shuffle
    
    for (let cell of emptyCells) {
        simBoard[cell.r][cell.c] = currentTurnPlayer;
        if (checkWin(simBoard, currentTurnPlayer)) return currentTurnPlayer;
        currentTurnPlayer = currentTurnPlayer === PLAYER_RED ? PLAYER_BLUE : PLAYER_RED;
    }
    return EMPTY;
}

// --- Cập nhật giao diện & Tiện ích ---
function addLog(entity, message, colorClass = "text-outline") {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
    const logHTML = `
        <div class="flex gap-3 text-[11px] items-start animate-fade-in">
            <span class="text-outline font-label shrink-0">${time}</span>
            <span class="${colorClass} font-bold">[${entity}]</span>
            <span class="text-on-surface-variant">${message}</span>
        </div>`;
    logEl.insertAdjacentHTML('afterbegin', logHTML);
}

function updateHUD() {
    document.getElementById('turn-counter').innerText = `Turn: ${currentTurn}`;
}

function endGame(winner) {
    isAITurn = true; // Block click
    if (winner === PLAYER_RED) {
        statusEl.innerText = "CRITICAL SUCCESS";
        addLog("SYSTEM", "Red Player has successfully breached the network. +50 EXP.", "text-secondary");
        if(typeof ScoreManager !== 'undefined') ScoreManager.addCoins(50);
        if(typeof SoundManager !== 'undefined') SoundManager.play('correct');
    } else {
        statusEl.innerText = "SYSTEM FAILURE";
        addLog("SYSTEM", "AI Core has blocked all paths. Connection lost.", "text-primary");
        if(typeof SoundManager !== 'undefined') SoundManager.play('wrong');
    }
}

document.getElementById('btn-restart').addEventListener('click', initGame);

// Start
initGame();