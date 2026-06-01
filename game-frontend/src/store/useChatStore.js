import { create } from 'zustand';
import { api, endpoints } from '../services/api';
import { connectSocket } from '../services/socket';

const useChatStore = create((set) => ({
  messages: {},
  activeChat: null,
  typingUsers: {},
  loading: false,

  initSocket: () => {
    const socket = connectSocket();
    if (!socket) return;

    socket.on('chat:new-message', (message) => {
      set((s) => {
        const key = message.sender._id;
        const existing = s.messages[key] || [];
        return {
          messages: { ...s.messages, [key]: [...existing, message] }
        };
      });
    });

    socket.on('chat:typing-indicator', ({ fromUserId, fromUsername }) => {
      set((s) => ({
        typingUsers: { ...s.typingUsers, [fromUserId]: fromUsername }
      }));
      setTimeout(() => {
        set((s) => {
          const next = { ...s.typingUsers };
          delete next[fromUserId];
          return { typingUsers: next };
        });
      }, 3000);
    });

    socket.on('chat:lobby-new-message', (message) => {
      set((s) => {
        const existing = s.messages['lobby'] || [];
        return {
          messages: { ...s.messages, lobby: [...existing, message] }
        };
      });
    });
  },

  setActiveChat: (userId) => set({ activeChat: userId }),

  fetchMessages: async (userId) => {
    set({ loading: true });
    try {
      const data = await api.get(endpoints.messagesConversation(userId));
      set((s) => ({
        messages: { ...s.messages, [userId]: data.messages || [] },
        loading: false
      }));
    } catch (_e) {
      set({ loading: false });
    }
  },

  sendMessage: (toUserId, content) => {
    const socket = connectSocket();
    if (!socket) return;
    socket.emit('chat:send-message', { toUserId, content });
  },

  sendTyping: (toUserId) => {
    const socket = connectSocket();
    if (!socket) return;
    socket.emit('chat:typing', { toUserId });
  },

  joinLobby: () => {
    const socket = connectSocket();
    if (!socket) return;
    socket.emit('chat:join-lobby');
  },

  sendLobbyMessage: (content) => {
    const socket = connectSocket();
    if (!socket) return;
    socket.emit('chat:lobby-message', { content });
  }
}));

export default useChatStore;
