import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  showAuth: false,
  isLoginMode: true,

  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token, showAuth: false });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_avatar_custom');
    set({ user: null, token: null, showAuth: false });
  },

  setShowAuth: (showAuth) => set({ showAuth }),
  setIsLoginMode: (isLoginMode) => set({ isLoginMode }),

  syncUser: () => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    set({
      user: savedUser ? JSON.parse(savedUser) : null,
      token: token || null,
    });
  },

  updateUser: (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },
}));

export default useAuthStore;
