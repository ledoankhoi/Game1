import { create } from 'zustand';
import { api, endpoints } from '../services/api';

const useGameStore = create((set, _get) => ({
  games: [],
  categories: ['All'],
  activeCategory: 'All',
  favoriteGames: [],
  recommendations: [],
  loading: false,
  error: null,

  setActiveCategory: (category) => set({ activeCategory: category }),

  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(endpoints.gameList);
      if (data.success && Array.isArray(data.games)) {
        const games = data.games;
        const uniqueCategories = [
          'All',
          ...new Set(
            games.flatMap((g) =>
              Array.isArray(g?.category) ? g.category : [g?.category]
            ).filter(Boolean)
          ),
        ];
        set({ games, categories: uniqueCategories, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  fetchFavorites: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await api.get(endpoints.profile);
      if (data.success && data.user) {
        set({
          favoriteGames: Array.isArray(data.user.favoriteGames)
            ? data.user.favoriteGames
            : [],
        });
      }
    } catch (_e) { /* silent */ }
  },

  fetchRecommendations: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await api.get(endpoints.recommendations);
      if (data.success) set({ recommendations: data.games });
    } catch (_e) { /* silent */ }
  },

  toggleFavorite: async (gameSlug) => {
    try {
      const data = await api.post(endpoints.toggleFavorite, { gameSlug });
      if (data.success) {
        set({
          favoriteGames: Array.isArray(data.favoriteGames)
            ? data.favoriteGames
            : [],
        });
      }
    } catch (_e) { /* silent */ }
  },
}));

export default useGameStore;
