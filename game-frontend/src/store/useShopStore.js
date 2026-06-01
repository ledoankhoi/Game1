import { create } from 'zustand';
import { api, endpoints } from '../services/api';

const useShopStore = create((set, _get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get(endpoints.shopItems);
      set({ items: data.items || data.data || [], loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  buyItem: async (itemId) => {
    try {
      const data = await api.post(endpoints.shopBuy, { itemId });
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  equipItem: async (itemId) => {
    try {
      const data = await api.post(endpoints.shopEquip, { itemId });
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
}));

export default useShopStore;
