/* global io, Chess */

const socket = io({ transports: ['websocket', 'polling'] });

let game = null;
let myColor = null;
let currentRoomId = null;
let selectedSquare = null;
let playerName = '';

const PIECES = {
    w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
    b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    playerName = savedUser.username || '';

    document.getElementById('username-input').value = playerName;
    document.getElementById('create-room-btn').addEventListener('click', createRoom);
    document.getElementById('join-room-btn').addEventListener('click', joinRoom);
    document.getElementById('room-code-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') joinRoom(); });
    document.getElementById('cancel-wait-btn').addEventListener('click', leaveRoom);
    document.getElementById('leave-game-btn').addEventListener('click', leaveRoom);
    document.getElementById('rematch-btn').addEventListener('click', () => socket.emit('chess:rematch'));
    document.getElementById('go-lobby-btn').addEventListener('click', () => { resetUI(); leaveRoom(); });

    setupSocketListeners();
    socket.emit('chess:join-lobby', { username: playerName || 'Guest' });
});

function setupSocketListeners() {
    socket.on('connect', () => {
        socket.emit('chess:join-lobby', { username: playerName || 'Guest' });
    });

    socket.on('chess:lobby-update', (rooms) => {
        renderRoomList(rooms);
    });

    socket.on('chess:room-joined', (data) => {
        currentRoomId = data.roomId;
        myColor = data.color;
        document.getElementById('room-code-display').innerText = data.roomId;
        showGameUI();
        updatePlayersBar(data.players);
        removeStartBtn();
        if (data.players.length === 2) {
            document.getElementById('waiting-overlay').classList.remove('hidden');
            document.getElementById('cancel-wait-btn').classList.add('hidden');
            if (myColor === 'w') {
                document.getElementById('waiting-text').innerText = 'Sẵn sàng! Bấm Bắt Đầu.';
                addStartBtn();
            } else {
                document.getElementById('waiting-text').innerText = 'Đã tham gia. Đang chờ chủ phòng bắt đầu...';
            }
        } else {
            document.getElementById('waiting-overlay').classList.remove('hidden');
            document.getElementById('waiting-text').innerText = 'Đang chờ đối thủ...';
            document.getElementById('cancel-wait-btn').classList.remove('hidden');
        }
    });

    socket.on('chess:opponent-joined', () => {
        removeStartBtn();
        document.getElementById('waiting-overlay').classList.remove('hidden');
        document.getElementById('cancel-wait-btn').classList.add('hidden');
        if (myColor === 'w') {
            document.getElementById('waiting-text').innerText = 'Sẵn sàng! Bấm Bắt Đầu.';
            addStartBtn();
        }
    });

    socket.on('chess:room-update', (data) => {
        updatePlayersBar(data.players);
    });

    socket.on('chess:game-start', (data) => {
        game = new Chess(data.fen);
        myColor = data.players.find(p => p.id === socket.id)?.color || 'w';
        document.getElementById('waiting-overlay').classList.add('hidden');
        const oldBtn = document.getElementById('start-game-btn');
        if (oldBtn) oldBtn.remove();
        document.getElementById('board-wrapper').classList.remove('hidden');
        updatePlayersBar(data.players);
        renderBoard();
        updateTurnDisplay();
        document.getElementById('moves-list').innerHTML = '';
    });

    socket.on('chess:move-made', (data) => {
        game = new Chess(data.fen);
        renderBoard();
        updateTurnDisplay();
        addMoveToHistory(data.move.san);
    });

    socket.on('chess:game-over', (data) => {
        document.getElementById('go-result').innerText = data.result;
        document.getElementById('gameover-overlay').classList.remove('hidden');
        document.getElementById('board-wrapper').classList.add('hidden');
    });

    socket.on('chess:opponent-left', () => {
        resetGame();
        removeStartBtn();
        document.getElementById('waiting-overlay').classList.remove('hidden');
        document.getElementById('board-wrapper').classList.add('hidden');
        document.getElementById('gameover-overlay').classList.add('hidden');
        if (myColor === 'w') {
            document.getElementById('waiting-text').innerText = 'Đối thủ đã rời đi. Đang chờ...';
            document.getElementById('cancel-wait-btn').classList.remove('hidden');
        } else {
            document.getElementById('waiting-text').innerText = 'Chủ phòng đã rời.';
            document.getElementById('cancel-wait-btn').classList.add('hidden');
        }
    });

    socket.on('chess:error', (msg) => {
        alert(msg);
    });

    socket.on('connect_error', () => {
        alert('Không thể kết nối đến máy chủ. Vui lòng đảm bảo backend đang chạy ở port 5000.');
    });

    socket.on('disconnect', () => {
        alert('Mất kết nối đến máy chủ!');
    });
}

function createRoom() {
    const name = document.getElementById('username-input').value.trim() || 'Guest';
    playerName = name;
    socket.emit('chess:create-room', { username: playerName });
}

function joinRoom() {
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();
    if (code.length < 3) return alert('Nhập mã phòng (4 ký tự)');
    const name = document.getElementById('username-input').value.trim() || 'Guest';
    playerName = name;
    socket.emit('chess:join-room', { roomId: code, username: playerName });
}

function leaveRoom() {
    if (currentRoomId) {
        socket.emit('chess:leave-room', currentRoomId);
    }
    resetUI();
}

function renderRoomList(rooms) {
    const container = document.getElementById('room-list');
    document.getElementById('room-count').innerText = rooms.length;
    if (rooms.length === 0) {
        container.innerHTML = '<div class="text-center text-sm text-slate-600 italic mt-6">Chưa có phòng nào</div>';
        return;
    }
    container.innerHTML = rooms.map(r => `
        <div class="room-item flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:border-primary/50 transition-all" onclick="joinRoomByCode('${r.id}')">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-lg">meeting_room</span>
                <div>
                    <span class="font-bold text-sm text-slate-200">${r.host}</span>
                    <span class="text-[10px] text-slate-500 block font-mono">${r.id}</span>
                </div>
            </div>
            <span class="text-xs text-slate-500">1/2</span>
        </div>
    `).join('');
}

// eslint-disable-next-line no-unused-vars
function joinRoomByCode(code) {
    document.getElementById('room-code-input').value = code;
    joinRoom();
}

function addStartBtn() {
    const oldBtn = document.getElementById('start-game-btn');
    if (oldBtn) return;
    const startBtn = document.createElement('button');
    startBtn.id = 'start-game-btn';
    startBtn.className = 'mt-4 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg';
    startBtn.innerText = 'BẮT ĐẦU';
    startBtn.addEventListener('click', () => socket.emit('chess:start-game'));
    document.getElementById('waiting-overlay').appendChild(startBtn);
}

function removeStartBtn() {
    const oldBtn = document.getElementById('start-game-btn');
    if (oldBtn) oldBtn.remove();
}

function renderBoard() {
    if (!game) return;
    const boardEl = document.getElementById('chess-board');
    boardEl.innerHTML = '';

    const board = game.board();
    const isMyTurn = (game.turn() === 'w' ? 'w' : 'b') === myColor;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            square.className = `chess-square ${isLight ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const file = 'abcdefgh'[col];
            const rank = 8 - row;
            const sq = `${file}${rank}`;

            if (selectedSquare === sq) {
                square.classList.add('selected');
            }

            if (game.in_check() && board[row][col] &&
                board[row][col].type === 'k' &&
                board[row][col].color === game.turn()) {
                square.classList.add('check');
            }

            const piece = board[row][col];
            if (piece) {
                const span = document.createElement('span');
                span.className = 'chess-piece';
                span.innerText = PIECES[piece.color][piece.type.toUpperCase()] || '';
                square.appendChild(span);
            }

            square.addEventListener('click', () => onSquareClick(sq));
            boardEl.appendChild(square);
        }
    }

    if (selectedSquare && isMyTurn) {
        const moves = game.moves({ square: selectedSquare, verbose: true });
        moves.forEach(m => {
            const targetFile = m.to.charCodeAt(0) - 97;
            const targetRank = 8 - parseInt(m.to[1]);
            const idx = targetRank * 8 + targetFile;
            const child = boardEl.children[idx];
            if (child) {
                if (m.captured) {
                    child.classList.add('capture');
                } else {
                    child.classList.add('highlight');
                }
            }
        });
    }
}

function onSquareClick(sq) {
    if (!game) return;
    if ((game.turn() === 'w' ? 'w' : 'b') !== myColor) return;

    if (selectedSquare) {
        const moves = game.moves({ square: selectedSquare, verbose: true });
        const isTarget = moves.some(m => m.to === sq);
        if (isTarget) {
            socket.emit('chess:make-move', { from: selectedSquare, to: sq, promotion: 'q' });
            selectedSquare = null;
            return;
        }
    }

    const piece = game.get(sq);
    if (piece && piece.color === myColor) {
        selectedSquare = sq;
        renderBoard();
    } else {
        selectedSquare = null;
        renderBoard();
    }
}

function updateTurnDisplay() {
    if (!game) return;
    const turn = game.turn() === 'w' ? 'w' : 'b';
    const indicator = document.getElementById('turn-indicator');
    const text = document.getElementById('turn-text');
    const isMyTurn = turn === myColor;

    indicator.className = `w-3 h-3 rounded-full ${turn === 'w' ? 'bg-slate-100' : 'bg-slate-900 border border-slate-500'}`;
    text.innerText = isMyTurn ? 'Lượt của bạn' : 'Đối thủ đang đi...';
    text.className = `text-sm font-bold ${isMyTurn ? 'text-emerald-400' : 'text-slate-500'}`;
}

function updatePlayersBar(players) {
    const white = players.find(p => p.color === 'w');
    const black = players.find(p => p.color === 'b');
    if (white) {
        document.querySelector('#player-white span:last-child').innerText = white.username;
    }
    if (black) {
        document.querySelector('#player-black span:last-child').innerText = black.username;
    }
}

function addMoveToHistory(san) {
    const list = document.getElementById('moves-list');
    const span = document.createElement('span');
    span.className = 'bg-slate-700/50 px-2 py-1 rounded text-slate-300';
    span.innerText = san;
    list.appendChild(span);
    list.scrollTop = list.scrollHeight;
}

function showGameUI() {
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('game-info').classList.remove('hidden');
    document.getElementById('players-bar').classList.remove('hidden');
}

function resetUI() {
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('game-info').classList.add('hidden');
    document.getElementById('players-bar').classList.add('hidden');
    document.getElementById('board-wrapper').classList.add('hidden');
    document.getElementById('waiting-overlay').classList.add('hidden');
    document.getElementById('gameover-overlay').classList.add('hidden');
    document.getElementById('moves-list').innerHTML = '';
    currentRoomId = null;
    myColor = null;
    selectedSquare = null;
    game = null;
}

function resetGame() {
    game = null;
    selectedSquare = null;
    document.getElementById('board-wrapper').classList.add('hidden');
    document.getElementById('moves-list').innerHTML = '';
}
