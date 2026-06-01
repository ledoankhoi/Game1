import { create } from 'zustand';
import { api, endpoints } from '../services/api';
import { connectSocket } from '../services/socket';

const useGuildStore = create((set, get) => ({
  myGuild: null,
  guilds: [],
  leaderboard: [],
  guildMessages: [],
  loading: false,
  error: null,

  initSocket: () => {
    const socket = connectSocket();
    if (!socket) return;

    socket.on('guild:chat-message', (message) => {
      set((s) => ({
        guildMessages: [...s.guildMessages, message]
      }));
    });
  },

  createGuild: async (data) => {
    try {
      const result = await api.post(endpoints.guildCreate, data);
      if (result.success) {
        await get().fetchMyGuild();
      }
      return result;
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  fetchMyGuild: async () => {
    set({ loading: true });
    try {
      const data = await api.get(endpoints.guildMy);
      set({ myGuild: data.guild || null, loading: false });
    } catch (_e) {
      set({ loading: false });
    }
  },

  fetchGuild: async (id) => {
    set({ loading: true });
    try {
      const data = await api.get(endpoints.guildInfo(id));
      set({ guild: data.guild, loading: false });
      return data.guild;
    } catch (_e) {
      set({ loading: false });
    }
  },

  fetchLeaderboard: async () => {
    try {
      const data = await api.get(endpoints.guildLeaderboard);
      set({ leaderboard: data.guilds || [] });
    } catch (_e) { /* silent */ }
  },

  joinGuild: async (id) => {
    try {
      const data = await api.post(endpoints.guildJoin(id));
      if (data.success) await get().fetchMyGuild();
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  leaveGuild: async (id) => {
    try {
      const data = await api.post(endpoints.guildLeave(id));
      if (data.success) set({ myGuild: null });
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  kickMember: async (guildId, memberId) => {
    try {
      const data = await api.post(endpoints.guildKick(guildId), { memberId });
      if (data.success) await get().fetchMyGuild();
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  promoteMember: async (guildId, memberId, role) => {
    try {
      const data = await api.post(endpoints.guildPromote(guildId), { memberId, role });
      if (data.success) await get().fetchMyGuild();
      return data;
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  sendGuildMessage: (guildId, content) => {
    const socket = connectSocket();
    if (!socket) return;
    socket.emit('guild:chat-send', { guildId, content });
  },

  fetchGuildMessages: async (guildId) => {
    try {
      const data = await api.get(endpoints.messagesGuild(guildId));
      set({ guildMessages: data.messages || [] });
    } catch (_e) { /* silent */ }
  }
}));

export default useGuildStore;
