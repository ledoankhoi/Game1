const { Chess } = require('chess.js');

const rooms = new Map();

function chessHandler(io) {
    io.on('connection', (socket) => {
        socket.on('chess:join-lobby', (data) => {
            socket.join('lobby');
            const username = data?.username || 'Guest';
            socket.data.username = username;
            io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
        });

        socket.on('chess:create-room', (data) => {
            if (data?.username) socket.data.username = data.username;
            const roomId = generateRoomId();
            const username = socket.data.username || 'Guest';
            const room = {
                id: roomId,
                players: [{ id: socket.id, username, color: 'w', ready: false }],
                spectators: [],
                chess: new Chess(),
                moves: [],
                status: 'waiting',
                timer: data?.timer || 0,
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('chess:room-joined', { roomId, color: 'w', players: room.players });
            io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
        });

        socket.on('chess:join-room', (data) => {
            const roomId = typeof data === 'string' ? data : data?.roomId;
            if (data?.username) socket.data.username = data.username;
            const room = rooms.get(roomId);
            if (!room) return socket.emit('chess:error', 'Phòng không tồn tại');
            if (room.status !== 'waiting') return socket.emit('chess:error', 'Phòng đã bắt đầu');
            if (room.players.length >= 2) return socket.emit('chess:error', 'Phòng đã đầy');

            const username = socket.data.username || 'Guest';
            room.players.push({ id: socket.id, username, color: 'b', ready: false });
            socket.join(roomId);
            socket.emit('chess:room-joined', { roomId, color: 'b', players: room.players });
            io.to(roomId).emit('chess:opponent-joined', { username, color: 'b' });
            io.to(roomId).emit('chess:room-update', { players: room.players });
            io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
        });

        socket.on('chess:start-game', () => {
            const room = findRoomByPlayer(socket.id);
            if (!room) return;
            if (room.players.length < 2) return socket.emit('chess:error', 'Cần 2 người chơi');
            room.status = 'playing';
            room.chess = new Chess();
            room.moves = [];
            io.to(room.id).emit('chess:game-start', {
                fen: room.chess.fen(),
                turn: 'w',
                players: room.players,
            });
        });

        socket.on('chess:make-move', (move) => {
            const room = findRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') return;

            const player = room.players.find(p => p.id === socket.id);
            if (!player) return;

            const color = room.chess.turn() === 'w' ? 'w' : 'b';
            if (player.color !== color) return socket.emit('chess:error', 'Không phải lượt của bạn');

            try {
                const result = room.chess.move(move);
                if (!result) return socket.emit('chess:error', 'Nước đi không hợp lệ');

                room.moves.push(result.san);

                io.to(room.id).emit('chess:move-made', {
                    fen: room.chess.fen(),
                    move: result,
                    turn: room.chess.turn(),
                });

                if (room.chess.isGameOver()) {
                    let resultMsg = 'Hòa';
                    if (room.chess.isCheckmate()) {
                        const winner = room.chess.turn() === 'w' ? 'Đen' : 'Trắng';
                        resultMsg = `${winner} thắng bằng chiếu hết!`;
                    } else if (room.chess.isStalemate()) {
                        resultMsg = 'Hòa do Stalemate';
                    } else if (room.chess.isDraw()) {
                        resultMsg = 'Hòa';
                    }

                    room.status = 'finished';
                    io.to(room.id).emit('chess:game-over', {
                        result: resultMsg,
                        winner: room.chess.turn() === 'w' ? 'b' : 'w',
                        moves: room.moves,
                    });
                    setTimeout(() => {
                        rooms.delete(room.id);
                        io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
                    }, 60000);
                }
            } catch (e) {
                socket.emit('chess:error', 'Nước đi không hợp lệ');
            }
        });

        socket.on('chess:resign', () => {
            const room = findRoomByPlayer(socket.id);
            if (!room || room.status !== 'playing') return;
            const player = room.players.find(p => p.id === socket.id);
            if (!player) return;
            const winnerColor = player.color === 'w' ? 'b' : 'w';
            const winner = room.players.find(p => p.color === winnerColor);
            room.status = 'finished';
            io.to(room.id).emit('chess:game-over', {
                result: `${player.username} đầu hàng!`,
                winner: winner?.id,
                moves: room.moves,
            });
            setTimeout(() => {
                rooms.delete(room.id);
                io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
            }, 60000);
        });

        socket.on('chess:rematch', () => {
            const room = findRoomByPlayer(socket.id);
            if (!room) return;
            room.chess = new Chess();
            room.moves = [];
            room.status = 'playing';
            [room.players[0], room.players[1]] = [room.players[1], room.players[0]];
            room.players[0].color = 'w';
            room.players[1].color = 'b';
            io.to(room.id).emit('chess:game-start', {
                fen: room.chess.fen(),
                turn: 'w',
                players: room.players,
                rematch: true,
            });
        });

        socket.on('chess:leave-room', () => {
            const room = findRoomByPlayer(socket.id);
            if (room) {
                socket.leave(room.id);
                room.players = room.players.filter(p => p.id !== socket.id);
                if (room.players.length === 0) {
                    rooms.delete(room.id);
                } else {
                    room.status = 'waiting';
                    io.to(room.id).emit('chess:opponent-left');
                    io.to(room.id).emit('chess:room-update', { players: room.players });
                }
                io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
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
                    io.to(room.id).emit('chess:opponent-left');
                    io.to(room.id).emit('chess:room-update', { players: room.players });
                }
            }
            io.to('lobby').emit('chess:lobby-update', getLobbyInfo(io));
        });
    });
}

function findRoomByPlayer(socketId) {
    for (const room of rooms.values()) {
        if (room.players.some(p => p.id === socketId)) return room;
    }
    return null;
}

function getLobbyInfo(io) {
    const list = [];
    for (const room of rooms.values()) {
        if (room.status === 'waiting' && room.players.length === 1) {
            list.push({
                id: room.id,
                host: room.players[0]?.username || 'Guest',
                players: room.players.length,
                timer: room.timer,
            });
        }
    }
    return list;
}

function generateRoomId() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

module.exports = chessHandler;
