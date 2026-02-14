document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

// --- CẤU HÌNH (11x12 Grid logic) ---
const CONFIG = {
    SIZE_COL: 11,
    SIZE_ROW: 12, // 11 Hàng Map + 1 Hàng Entry
    OBSTACLES: [
        {x: 1, y: 2}, {x: 1, y: 8}, {x: 2, y: 6}, 
        {x: 3, y: 1}, {x: 4, y: 9}, {x: 5, y: 7}, 
        {x: 7, y: 10}, {x: 9, y: 2}, 
        {x: 11, y: 9}, {x: 11, y: 6}
    ],
    ENTRY_COLS: [0, 2, 8, 10], 
    EXIT_COLS: [4, 5, 6] 
};

let GAME = {
    board: [], 
    turn: 'blue', 
    selected: null, 
    moves: [], 
    winner: null,
    timer: null,
    timeLeft: 30,
    mustSpawn: false,
    players: {
        blue: { reserve: 4, onboard: 0, escaped: 0, color: 'piece-blue', name: 'XANH' },
        orange: { reserve: 4, onboard: 0, escaped: 0, color: 'piece-orange', name: 'CAM' }
    }
};

function initGame() {
    createBoard();
    renderBoard();
    updateUI();
    startTimer();
    logSystem("Kết nối hệ thống thành công.");
    logSystem("Đội Xanh đi trước.");
}

function createBoard() {
    GAME.board = Array(CONFIG.SIZE_ROW).fill(null).map(() => Array(CONFIG.SIZE_COL).fill(null));
    CONFIG.OBSTACLES.forEach(o => {
        if (o.y - 1 < 11) GAME.board[o.y - 1][o.x - 1] = { type: 'obs' };
    });
}

function renderBoard() {
    const el = document.getElementById('game-board');
    el.innerHTML = '';

    for (let r = 0; r < CONFIG.SIZE_ROW; r++) {
        for (let c = 0; c < CONFIG.SIZE_COL; c++) {
            const cell = document.createElement('div');
            cell.dataset.r = r; cell.dataset.c = c;
            cell.onclick = () => onCellClick(r, c);

            // --- HÀNG ENTRY (Lồi) ---
            if (r === CONFIG.SIZE_ROW - 1) {
                if (CONFIG.ENTRY_COLS.includes(c)) {
                    cell.className = 'grid-cell entry-zone flex items-center justify-center';
                    if (!GAME.board[r][c]) cell.innerHTML = '<span class="material-icons text-slate-600 text-[10px]">arrow_upward</span>';
                    
                    if (GAME.mustSpawn && GAME.players[GAME.turn].reserve > 0 && !GAME.board[r][c]) {
                        cell.classList.add('ring-2', 'ring-green-500', 'animate-pulse');
                    }
                } else {
                    cell.className = 'cell-void'; 
                }
            } 
            // --- BÀN CỜ CHÍNH ---
            else {
                cell.className = 'grid-cell flex items-center justify-center';
                if (r === 0 && CONFIG.EXIT_COLS.includes(c)) cell.classList.add('exit-zone');
            }

            // Vật thể
            const item = GAME.board[r][c];
            if (item) {
                if (item.type === 'obs') cell.classList.add('obstacle');
                else if (item.type === 'piece') {
                    const p = document.createElement('div');
                    p.className = `piece ${GAME.players[item.owner].color}`;
                    if (GAME.selected && GAME.selected.r === r && GAME.selected.c === c) p.classList.add('piece-selected');
                    cell.appendChild(p);
                }
            }

            // Gợi ý
            if (GAME.moves.some(m => m.r === r && m.c === c)) cell.classList.add('valid-move');

            el.appendChild(cell);
        }
    }
}

function calculateMoves(sr, sc) {
    const res = [];
    const dirs = [{dr:-1,dc:0}, {dr:1,dc:0}, {dr:0,dc:-1}, {dr:0,dc:1}];

    dirs.forEach(d => {
        if (sr === CONFIG.SIZE_ROW - 1 && d.dr !== -1) return; // Entry chỉ đi lên

        let r = sr, c = sc;
        while (true) {
            let nr = r + d.dr, nc = c + d.dc;
            if (nr < 0 || nr >= CONFIG.SIZE_ROW || nc < 0 || nc >= CONFIG.SIZE_COL) break;
            if (nr === CONFIG.SIZE_ROW - 1 && !CONFIG.ENTRY_COLS.includes(nc)) break; // Void check
            if (GAME.board[nr][nc]) break;
            r = nr; c = nc; 
        }

        if (r !== sr || c !== sc) {
            let isExit = (r === 0 && CONFIG.EXIT_COLS.includes(c));
            res.push({ r, c, isExit });
        }
    });
    return res;
}

function onCellClick(r, c) {
    if (GAME.winner) return;
    const cell = GAME.board[r][c];
    const p = GAME.players[GAME.turn];

    if (GAME.mustSpawn) {
        if (r === CONFIG.SIZE_ROW - 1 && CONFIG.ENTRY_COLS.includes(c) && !cell) {
            doSpawn(r, c);
        } else {
            msg("Cần thả quân tiếp viện!");
            playSound('error');
        }
        return; 
    }

    if (r === CONFIG.SIZE_ROW - 1 && CONFIG.ENTRY_COLS.includes(c) && !cell) {
        if (p.onboard < 2 && p.reserve > 0) doSpawn(r, c);
        else msg("Không thể thả quân lúc này.");
        return;
    }

    const move = GAME.moves.find(m => m.r === r && m.c === c);
    if (move) { doMove(move); return; }

    if (cell && cell.type === 'piece' && cell.owner === GAME.turn) {
        GAME.selected = {r, c};
        GAME.moves = calculateMoves(r, c);
        renderBoard();
        playSound('select');
    } else {
        GAME.selected = null;
        GAME.moves = [];
        renderBoard();
    }
}

function doSpawn(r, c) {
    GAME.board[r][c] = { type: 'piece', owner: GAME.turn };
    GAME.players[GAME.turn].reserve--;
    GAME.players[GAME.turn].onboard++;
    
    if (GAME.mustSpawn) {
        GAME.mustSpawn = false;
        logSystem("Tiếp viện thành công.");
    } else {
        logSystem(`${GAME.players[GAME.turn].name} triển khai quân.`);
    }
    
    playSound('place');
    endTurn();
}

function doMove(m) {
    const {r, c} = GAME.selected;
    GAME.board[r][c] = null;

    if (m.isExit) {
        GAME.players[GAME.turn].onboard--;
        GAME.players[GAME.turn].escaped++;
        GAME.players[GAME.turn].reserve++; 
        playSound('win');
        
        logSystem(`${GAME.players[GAME.turn].name} ĐÃ THOÁT! (+1 Dự bị)`);

        if (GAME.players[GAME.turn].escaped >= 4) {
            endGame();
        } else {
            GAME.mustSpawn = true;
            GAME.selected = null;
            GAME.moves = [];
            msg("THOÁT THÀNH CÔNG! THẢ QUÂN NGAY!");
            renderBoard();
            startTimer(); 
        }
    } else {
        GAME.board[m.r][m.c] = { type: 'piece', owner: GAME.turn };
        playSound('slide');
        GAME.selected = null;
        GAME.moves = [];
        endTurn();
    }
}

function endTurn() {
    GAME.turn = GAME.turn === 'blue' ? 'orange' : 'blue';
    updateUI();
    renderBoard();
    startTimer();
    msg("");
}

function startTimer() {
    clearInterval(GAME.timer);
    GAME.timeLeft = 30;
    updateTimerUI();
    
    GAME.timer = setInterval(() => {
        GAME.timeLeft--;
        updateTimerUI();
        if (GAME.timeLeft <= 0) {
            clearInterval(GAME.timer);
            logSystem("Hết giờ! Mất lượt.");
            if(GAME.mustSpawn) GAME.mustSpawn = false; 
            endTurn();
        }
    }, 1000);
}

function updateTimerUI() {
    const el = document.getElementById('game-timer');
    if(el) {
        el.innerText = GAME.timeLeft;
        el.className = `font-mono text-lg font-bold ${GAME.timeLeft <= 5 ? 'text-red-500 animate-ping' : 'text-yellow-500'}`;
    }
}

function updateUI() {
    // Cập nhật thẻ bài người chơi
    document.getElementById('p1-reserve').innerText = GAME.players.blue.reserve;
    document.getElementById('p1-escaped').innerText = `${GAME.players.blue.escaped}/4`;
    document.getElementById('p2-reserve').innerText = GAME.players.orange.reserve;
    document.getElementById('p2-escaped').innerText = `${GAME.players.orange.escaped}/4`;

    const p1Card = document.getElementById('p1-card');
    const p2Card = document.getElementById('p2-card');
    const turnText = document.getElementById('turn-text');
    const turnDot = document.getElementById('turn-dot');

    if (GAME.turn === 'blue') {
        p1Card.classList.remove('opacity-60', 'border-transparent');
        p1Card.classList.add('border-blue-500', 'scale-105');
        p2Card.classList.add('opacity-60', 'border-transparent');
        p2Card.classList.remove('border-orange-500', 'scale-105');
        
        turnText.innerText = "LƯỢT ĐỘI XANH";
        turnText.className = "text-blue-500 font-bold tracking-widest text-sm uppercase";
        turnDot.className = "w-2 h-2 rounded-full bg-blue-500 animate-pulse";
    } else {
        p2Card.classList.remove('opacity-60', 'border-transparent');
        p2Card.classList.add('border-orange-500', 'scale-105');
        p1Card.classList.add('opacity-60', 'border-transparent');
        p1Card.classList.remove('border-blue-500', 'scale-105');

        turnText.innerText = "LƯỢT ĐỘI CAM";
        turnText.className = "text-orange-500 font-bold tracking-widest text-sm uppercase";
        turnDot.className = "w-2 h-2 rounded-full bg-orange-500 animate-pulse";
    }
}

function logSystem(msg) {
    const log = document.getElementById('system-log');
    if (log) {
        const p = document.createElement('p');
        p.className = "text-slate-400";
        p.innerText = `> ${msg}`;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }
}

function msg(t) { 
    const el = document.getElementById('game-message');
    if(el) el.innerText = t; 
}

function endGame() {
    GAME.winner = GAME.turn;
    clearInterval(GAME.timer);
    const modal = document.getElementById('modal-endgame');
    const text = document.getElementById('winner-text');
    if(modal) {
        modal.classList.remove('hidden');
        text.innerText = (GAME.turn === 'blue' ? "ĐỘI XANH" : "ĐỘI CAM") + " THẮNG!";
    }
}

function playSound(t) {}