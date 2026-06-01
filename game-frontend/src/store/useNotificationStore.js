import { create } from 'zustand';
import { connectSocket } from '../services/socket';
import useAuthStore from './useAuthStore';

let initialized = false;

const useNotificationStore = create((set, get) => ({
  unreadCounts: {},

  init: () => {
    if (initialized) return;
    initialized = true;

    const socket = connectSocket();
    if (!socket) return;

    socket.on('chat:new-message', (message) => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;
      const senderId = message.sender?._id;
      const receiverId = message.receiver?.toString();
      const currentId = currentUser.id || currentUser._id;
      const otherId = senderId === currentId ? receiverId : senderId;
      if (!otherId || senderId === currentId) return;
      set((s) => ({
        unreadCounts: { ...s.unreadCounts, [otherId]: (s.unreadCounts[otherId] || 0) + 1 }
      }));
    });

    socket.on('guild:chat-message', (message) => {
      const currentUser = useAuthStore.getState().user;
      if (!message.guildId) return;
      const senderId = message.sender?._id;
      const currentId = currentUser?.id || currentUser?._id;
      if (senderId === currentId) return;
      const key = `guild:${message.guildId}`;
      set((s) => ({
        unreadCounts: { ...s.unreadCounts, [key]: (s.unreadCounts[key] || 0) + 1 }
      }));
    });
  },

  setRead: (key) => set((s) => ({
    unreadCounts: key ? { ...s.unreadCounts, [key]: 0 } : s.unreadCounts
  })),

  totalUnread: () => Object.values(get().unreadCounts).reduce((sum, n) => sum + n, 0)
}));

export default useNotificationStore;
