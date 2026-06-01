import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('token');
  if (!token) return null;

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling']
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
