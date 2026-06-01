/* global io */

const socket = io({ transports: ['websocket', 'polling'] });

let board = [];
let myColor = 0;
let currentRoomId = null;
let playerName = '';
let validMoves = [];
let lastMove = null;

document.addEventListener('DOMContentLoaded', () => {
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  playerName = savedUser.username || '';

  document.getElementById('username-input').value = playerName;
  document.getElementById('create-room-btn').addEventListener('click', createRoom);
  document.getElementById('join-room-btn').addEventListener('click', joinRoom);
  document.getElementById('room-code-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') joinRoom(); });
  document.getElementById('cancel-wait-btn').addEventListener('click', leaveRoom);
  document.getElementById('leave-game-btn').addEventListener('click', leaveRoom);
  document.getElementById('rematch-btn').addEventListener('click', () => socket.emit('othello:rematch'));
  document.getElementById('go-lobby-btn').addEventListener('click', () => { resetUI(); leaveRoom(); });

  setupSocketListeners();
  socket.emit('othello:join-lobby', { username: playerName || 'Guest' });
});

function setupSocketListeners() {
  socket.on('connect', () => {
    socket.emit('othello:join-lobby', { username: playerName || 'Guest' });
  });

  socket.on('othello:lobby-update', (rooms) => {
    renderRoomList(rooms);
  });

  socket.on('othello:room-joined', (data) => {
    currentRoomId = data.roomId;
    myColor = data.color;
    document.getElementById('room-code-display').innerText = data.roomId;
    showGameUI();
    updatePlayersBar(data.players);
    removeStartBtn();
    if (data.players.length === 2) {
      document.getElementById('waiting-overlay').classList.remove('hidden');
      document.getElementById('cancel-wait-btn').classList.add('hidden');
      if (myColor === 1) {
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

  socket.on('othello:opponent-joined', () => {
    removeStartBtn();
    document.getElementById('waiting-overlay').classList.remove('hidden');
    document.getElementById('cancel-wait-btn').classList.add('hidden');
    if (myColor === 1) {
      document.getElementById('waiting-text').innerText = 'Sẵn sàng! Bấm Bắt Đầu.';
      addStartBtn();
    }
  });

  socket.on('othello:room-update', (data) => {
    updatePlayersBar(data.players);
  });

  socket.on('othello:game-start', (data) => {
    board = data.board;
    myColor = data.players.find(p => p.id === socket.id)?.color || 1;
    validMoves = data.validMoves || [];
    lastMove = null;
    document.getElementById('waiting-overlay').classList.add('hidden');
    const oldBtn = document.getElementById('start-game-btn');
    if (oldBtn) oldBtn.remove();
    document.getElementById('board-wrapper').classList.remove('hidden');
    updatePlayersBar(data.players);
    renderBoard();
    updateTurnDisplay(data.currentTurn);
    updateScore();
  });

  socket.on('othello:move-made', (data) => {
    board = data.board;
    validMoves = data.validMoves || [];
    lastMove = data.move ? { row: data.move.row, col: data.move.col } : null;
    renderBoard();
    updateTurnDisplay(data.currentTurn);
    updateScore();
  });

  socket.on('othello:game-over', (data) => {
    document.getElementById('go-result').innerText = data.result;
    document.getElementById('gameover-overlay').classList.remove('hidden');
    document.getElementById('board-wrapper').classList.add('hidden');
  });

  socket.on('othello:opponent-left', () => {
    resetGame();
    removeStartBtn();
    document.getElementById('waiting-overlay').classList.remove('hidden');
    document.getElementById('board-wrapper').classList.add('hidden');
    document.getElementById('gameover-overlay').classList.add('hidden');
    if (myColor === 1) {
      document.getElementById('waiting-text').innerText = 'Đối thủ đã rời đi. Đang chờ...';
      document.getElementById('cancel-wait-btn').classList.remove('hidden');
    } else {
      document.getElementById('waiting-text').innerText = 'Chủ phòng đã rời.';
      document.getElementById('cancel-wait-btn').classList.add('hidden');
    }
  });

  socket.on('othello:error', (msg) => {
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
  socket.emit('othello:create-room', { username: playerName });
}

function joinRoom() {
  const code = document.getElementById('room-code-input').value.trim().toUpperCase();
  if (code.length < 3) return alert('Nhập mã phòng (4 ký tự)');
  const name = document.getElementById('username-input').value.trim() || 'Guest';
  playerName = name;
  socket.emit('othello:join-room', { roomId: code, username: playerName });
}

function leaveRoom() {
  if (currentRoomId) {
    socket.emit('othello:leave-room', {});
  }
  resetUI();
}

// eslint-disable-next-line no-unused-vars
function joinRoomByCode(code) {
  document.getElementById('room-code-input').value = code;
  joinRoom();
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

function addStartBtn() {
  const oldBtn = document.getElementById('start-game-btn');
  if (oldBtn) return;
  const startBtn = document.createElement('button');
  startBtn.id = 'start-game-btn';
  startBtn.className = 'mt-4 bg-primary hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg';
  startBtn.innerText = 'BẮT ĐẦU';
  startBtn.addEventListener('click', () => socket.emit('othello:start-game'));
  document.getElementById('waiting-overlay').appendChild(startBtn);
}

function removeStartBtn() {
  const oldBtn = document.getElementById('start-game-btn');
  if (oldBtn) oldBtn.remove();
}

function renderBoard() {
  const boardEl = document.getElementById('othello-board');
  boardEl.innerHTML = '';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'othello-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      const val = board[row]?.[col];

      if (lastMove && lastMove.row === row && lastMove.col === col) {
        cell.classList.add('last-move');
      }

      if (val === 1) {
        const piece = document.createElement('div');
        piece.className = 'othello-piece black';
        cell.appendChild(piece);
      } else if (val === 2) {
        const piece = document.createElement('div');
        piece.className = 'othello-piece white';
        cell.appendChild(piece);
      } else if (validMoves.some(m => m.row === row && m.col === col)) {
        cell.classList.add('valid-move');
      }

      cell.addEventListener('click', () => onCellClick(row, col));
      boardEl.appendChild(cell);
    }
  }
}

function onCellClick(row, col) {
  const isValid = validMoves.some(m => m.row === row && m.col === col);
  if (!isValid) return;

  socket.emit('othello:make-move', { row, col });
}

function updateTurnDisplay(turn) {
  const indicator = document.getElementById('turn-indicator');
  const text = document.getElementById('turn-text');
  const isMyTurn = turn === myColor;

  indicator.className = `w-3 h-3 rounded-full ${turn === 1 ? 'bg-slate-900 border border-slate-400' : 'bg-slate-100'}`;
  text.innerText = isMyTurn ? 'Lượt của bạn' : 'Đối thủ đang đi...';
  text.className = `text-sm font-bold ${isMyTurn ? 'text-emerald-400' : 'text-slate-500'}`;
}

function updatePlayersBar(players) {
  const black = players.find(p => p.color === 1);
  const white = players.find(p => p.color === 2);
  if (black) {
    document.querySelector('#player-black span:last-child').innerText = black.username;
  }
  if (white) {
    document.querySelector('#player-white span:last-child').innerText = white.username;
  }
}

function updateScore() {
  let black = 0, white = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r]?.[c] === 1) black++;
      else if (board[r]?.[c] === 2) white++;
    }
  }
  document.getElementById('score-black').innerText = black;
  document.getElementById('score-white').innerText = white;
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
  currentRoomId = null;
  myColor = 0;
  board = [];
  validMoves = [];
  lastMove = null;
}

function resetGame() {
  board = [];
  validMoves = [];
  lastMove = null;
  document.getElementById('board-wrapper').classList.add('hidden');
}
