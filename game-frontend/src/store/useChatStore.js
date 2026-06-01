import { create } from 'zustand';
import { api, endpoints } from '../services/api';
import { connectSocket } from '../services/socket';

let chatInitDone = false;

function addMessage(messages, key, message) {
  const existing = messages[key] || [];
  const dupe = existing.some(m => m._id === message._id);
  if (dupe) return messages;
  return { ...messages, [key]: [...existing, message] };
}

const useChatStore = create((set) => ({
  messages: {},
  activeChat: null,
  typingUsers: {},
  loading: false,

  initSocket: () => {
    if (chatInitDone) return;
    chatInitDone = true;
    const socket = connectSocket();
    if (!socket) return;

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
      set((s) => ({
        messages: addMessage(s.messages, 'lobby', message)
      }));
    });
  },

  setActiveChat: (userId) => set({ activeChat: userId }),

  fetchMessages: async (userId) => {
    set({ loading: true });
    try {
      const data = await api.get(endpoints.messagesConversation(userId));
      const fetched = data.messages || [];
      set((s) => {
        const existing = s.messages[userId] || [];
        const fetchedIds = new Set(fetched.map(m => m._id));
        const extra = existing.filter(m => !fetchedIds.has(m._id));
        return {
          messages: { ...s.messages, [userId]: [...fetched, ...extra] },
          loading: false
        };
      });
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
