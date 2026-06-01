import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (socket) return socket;

  const token = localStorage.getItem('token');
  if (!token) return null;

  socket = io('/', {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
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
