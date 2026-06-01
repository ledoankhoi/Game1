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
      const friends = data.friends || [];
      const seen = new Set();
      const uniqueFriends = friends.filter(f => {
        if (seen.has(f._id)) return false;
        seen.add(f._id);
        return true;
      });
      set({ friends: uniqueFriends, loading: false });
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
      return { success: false, error: e.response?.data?.message || e.message || 'Lỗi kết nối' };
    }
  },

  acceptRequest: async (requestId) => {
    try {
      const data = await api.post(endpoints.friendAccept, { requestId });
      await get().fetchFriends();
      await get().fetchRequests();
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message || 'Lỗi kết nối' };
    }
  },

  rejectRequest: async (requestId) => {
    try {
      await api.post(endpoints.friendReject, { requestId });
      await get().fetchRequests();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message || 'Lỗi kết nối' };
    }
  },

  removeFriend: async (friendId) => {
    try {
      await api.post(endpoints.friendRemove, { friendId });
      await get().fetchFriends();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message || 'Lỗi kết nối' };
    }
  },

  isOnline: (userId) => {
    return get().onlineUsers.has(userId);
  }
}));

export default useFriendStore;
