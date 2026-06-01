const rooms = new Map();

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function createBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(0));
  board[3][3] = 1; board[4][4] = 1;
  board[3][4] = 2; board[4][3] = 2;
  return board;
}

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getValidMoves(board, player) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== 0) continue;
      for (const [dr, dc] of DIRS) {
        let nr = r + dr, nc = c + dc;
        let foundOpponent = false;
        while (inBounds(nr, nc) && board[nr][nc] === (player === 1 ? 2 : 1)) {
          foundOpponent = true;
          nr += dr;
          nc += dc;
        }
        if (foundOpponent && inBounds(nr, nc) && board[nr][nc] === player) {
          moves.push({ row: r, col: c });
          break;
        }
      }
    }
  }
  return moves;
}

function makeMove(board, player, row, col) {
  const newBoard = cloneBoard(board);
  newBoard[row][col] = player;

  for (const [dr, dc] of DIRS) {
    let nr = row + dr, nc = col + dc;
    const toFlip = [];
    let valid = false;
    while (inBounds(nr, nc) && newBoard[nr][nc] === (player === 1 ? 2 : 1)) {
      toFlip.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    if (inBounds(nr, nc) && newBoard[nr][nc] === player && toFlip.length > 0) {
      valid = true;
      for (const [fr, fc] of toFlip) {
        newBoard[fr][fc] = player;
      }
    }
  }
  return newBoard;
}

function countPieces(board) {
  let black = 0, white = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 1) black++;
      else if (board[r][c] === 2) white++;
    }
  }
  return { black, white };
}

function isGameOver(board) {
  const blackMoves = getValidMoves(board, 1);
  const whiteMoves = getValidMoves(board, 2);
  return blackMoves.length === 0 && whiteMoves.length === 0;
}

function getResult(board) {
  const { black, white } = countPieces(board);
  if (black > white) return { winner: 1, text: `Đen thắng ${black}-${white}!` };
  if (white > black) return { winner: 2, text: `Trắng thắng ${white}-${black}!` };
  return { winner: 0, text: `Hòa ${black}-${white}!` };
}

function othelloHandler(io) {
  io.on('connection', (socket) => {
    socket.on('othello:join-lobby', (data) => {
      socket.join('lobby');
      socket.data.username = data?.username || 'Guest';
      io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
    });

    socket.on('othello:create-room', (data) => {
      if (data?.username) socket.data.username = data.username;
      const roomId = generateRoomId();
      const username = socket.data.username || 'Guest';
      const room = {
        id: roomId,
        players: [{ id: socket.id, username, color: 1, ready: false }],
        board: createBoard(),
        currentTurn: 1,
        status: 'waiting',
      };
      rooms.set(roomId, room);
      socket.join(roomId);
      socket.emit('othello:room-joined', { roomId, color: 1, players: room.players });
      io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
    });

    socket.on('othello:join-room', (data) => {
      const roomId = typeof data === 'string' ? data : data?.roomId;
      if (data?.username) socket.data.username = data.username;
      const room = rooms.get(roomId);
      if (!room) return socket.emit('othello:error', 'Phòng không tồn tại');
      if (room.status !== 'waiting') return socket.emit('othello:error', 'Phòng đã bắt đầu');
      if (room.players.length >= 2) return socket.emit('othello:error', 'Phòng đã đầy');

      const username = socket.data.username || 'Guest';
      room.players.push({ id: socket.id, username, color: 2, ready: false });
      socket.join(roomId);
      socket.emit('othello:room-joined', { roomId, color: 2, players: room.players });
      io.to(roomId).emit('othello:opponent-joined', { username, color: 2 });
      io.to(roomId).emit('othello:room-update', { players: room.players });
      io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
    });

    socket.on('othello:start-game', () => {
      const room = findRoomByPlayer(socket.id);
      if (!room) return;
      if (room.players.length < 2) return socket.emit('othello:error', 'Cần 2 người chơi');
      room.status = 'playing';
      room.board = createBoard();
      room.currentTurn = 1;
      const validMoves = getValidMoves(room.board, 1);
      io.to(room.id).emit('othello:game-start', {
        board: room.board,
        currentTurn: room.currentTurn,
        players: room.players,
        validMoves,
      });
    });

    socket.on('othello:make-move', (data) => {
      const room = findRoomByPlayer(socket.id);
      if (!room || room.status !== 'playing') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;
      if (player.color !== room.currentTurn) return socket.emit('othello:error', 'Không phải lượt của bạn');

      const { row, col } = data;
      const moves = getValidMoves(room.board, room.currentTurn);
      if (!moves.some(m => m.row === row && m.col === col)) {
        return socket.emit('othello:error', 'Nước đi không hợp lệ');
      }

      room.board = makeMove(room.board, room.currentTurn, row, col);

      const nextPlayer = room.currentTurn === 1 ? 2 : 1;
      let nextMoves = getValidMoves(room.board, nextPlayer);

      if (nextMoves.length === 0) {
        const skipMoves = getValidMoves(room.board, room.currentTurn);
        if (skipMoves.length === 0) {
          room.status = 'finished';
          const result = getResult(room.board);
          io.to(room.id).emit('othello:game-over', {
            result: result.text,
            winner: result.winner,
            board: room.board,
          });
          setTimeout(() => {
            rooms.delete(room.id);
            io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
          }, 60000);
          return;
        }
        room.currentTurn = room.currentTurn;
        nextMoves = getValidMoves(room.board, room.currentTurn);
      } else {
        room.currentTurn = nextPlayer;
      }

      io.to(room.id).emit('othello:move-made', {
        board: room.board,
        currentTurn: room.currentTurn,
        move: { row, col, player: player.color },
        validMoves: nextMoves,
      });
    });

    socket.on('othello:resign', () => {
      const room = findRoomByPlayer(socket.id);
      if (!room || room.status !== 'playing') return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;
      const winnerColor = player.color === 1 ? 2 : 1;
      const winner = room.players.find(p => p.color === winnerColor);
      room.status = 'finished';
      io.to(room.id).emit('othello:game-over', {
        result: `${player.username} đầu hàng!`,
        winner: winner?.id,
        board: room.board,
      });
      setTimeout(() => {
        rooms.delete(room.id);
        io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
      }, 60000);
    });

    socket.on('othello:rematch', () => {
      const room = findRoomByPlayer(socket.id);
      if (!room) return;
      room.board = createBoard();
      room.currentTurn = 1;
      room.status = 'playing';
      [room.players[0], room.players[1]] = [room.players[1], room.players[0]];
      room.players[0].color = 1;
      room.players[1].color = 2;
      const validMoves = getValidMoves(room.board, 1);
      io.to(room.id).emit('othello:game-start', {
        board: room.board,
        currentTurn: 1,
        players: room.players,
        validMoves,
        rematch: true,
      });
    });

    socket.on('othello:leave-room', () => {
      const room = findRoomByPlayer(socket.id);
      if (room) {
        socket.leave(room.id);
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(room.id);
        } else {
          room.status = 'waiting';
          io.to(room.id).emit('othello:opponent-left');
          io.to(room.id).emit('othello:room-update', { players: room.players });
        }
        io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
      }
    });

    socket.on('disconnect', () => {
      const room = findRoomByPlayer(socket.id);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(room.id);
        } else {
          room.status = 'waiting';
          io.to(room.id).emit('othello:opponent-left');
          io.to(room.id).emit('othello:room-update', { players: room.players });
        }
      }
      io.to('lobby').emit('othello:lobby-update', getLobbyInfo());
    });
  });
}

function findRoomByPlayer(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId)) return room;
  }
  return null;
}

function getLobbyInfo() {
  const list = [];
  for (const room of rooms.values()) {
    if (room.status === 'waiting' && room.players.length === 1) {
      list.push({
        id: room.id,
        host: room.players[0]?.username || 'Guest',
        players: room.players.length,
      });
    }
  }
  return list;
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

module.exports = othelloHandler;
