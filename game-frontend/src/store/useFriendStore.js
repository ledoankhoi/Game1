import { create } from 'zustand';
import { api, endpoints } from '../services/api';
import { connectSocket } from '../services/socket';

const useFriendStore = create((set, get) => ({
  friends: [],
  requests: [],
  onlineUsers: new Set(),
  loading: false,
  error: null,

  initSocket: () => {
    const socket = connectSocket();
    if (!socket) return;

    socket.on('friend:online', ({ userId }) => {
      set((s) => {
        const next = new Set(s.onlineUsers);
        next.add(userId);
        return { onlineUsers: next };
      });
    });

    socket.on('friend:offline', ({ userId }) => {
      set((s) => {
        const next = new Set(s.onlineUsers);
        next.delete(userId);
        return { onlineUsers: next };
      });
    });

    socket.on('friend:request-received', () => {
      get().fetchRequests();
    });

    socket.on('friend:accepted', () => {
      get().fetchFriends();
    });
  },

  fetchFriends: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(endpoints.friendList);
      set({ friends: data.friends || [], loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  fetchRequests: async () => {
    try {
      const data = await api.get(endpoints.friendRequests);
      set({ requests: data.requests || [] });
    } catch (_e) { /* silent */ }
  },

  sendRequest: async (username) => {
    try {
      const data = await api.post(endpoints.friendRequest, { username });
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  acceptRequest: async (requestId) => {
    try {
      const data = await api.post(endpoints.friendAccept, { requestId });
      await get().fetchFriends();
      await get().fetchRequests();
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  rejectRequest: async (requestId) => {
    try {
      await api.post(endpoints.friendReject, { requestId });
      await get().fetchRequests();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  removeFriend: async (friendId) => {
    try {
      await api.post(endpoints.friendRemove, { friendId });
      await get().fetchFriends();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  isOnline: (userId) => {
    return get().onlineUsers.has(userId);
  }
}));

export default useFriendStore;
