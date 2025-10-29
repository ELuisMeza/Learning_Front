import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TypeUser } from '../types/user.types';

interface TypeUserStore {
  user: TypeUser | null;
  token: string | null;
  setUser: (user: TypeUser) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'user-store';
const STORAGE_DATE_KEY = 'user-store-date';
const EXPIRATION_HOURS = 24;

/** Utilidades de fechas */
const updateSavedDate = () => localStorage.setItem(STORAGE_DATE_KEY, new Date().toISOString());

const isStoreExpired = (): boolean => {
  const saved = localStorage.getItem(STORAGE_DATE_KEY);
  if (!saved) return false;

  const last = new Date(saved);
  const diff = (Date.now() - last.getTime()) / (1000 * 60 * 60);
  const isNewDay = new Date().getDate() !== last.getDate();
  return isNewDay || diff >= EXPIRATION_HOURS;
};

const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_DATE_KEY);
};

/** Store principal */
export const useUserStore = create<TypeUserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => {
        set({ user });
        updateSavedDate();
      },

      setToken: (token) => {
        set({ token });
        updateSavedDate();
      },

      logout: () => {
        set({ user: null, token: null });
        clearStorage();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (isStoreExpired()) {
          clearStorage();
          state && state.logout();
        } else if (state?.user || state?.token) {
          updateSavedDate();
        }
      },
    }
  )
);

/** 🔄 Sincronización entre pestañas */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue === null) {
      // Si el usuario cerró sesión en otra pestaña, sincronizar esta
      useUserStore.getState().logout();
    }
  });
}
