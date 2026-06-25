import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Theme } from '@/types/app.types';

export const THEME_STORAGE_KEY = '@stanapp/theme';

interface ThemeState {
  preference: Theme;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (theme: Theme) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ preference: stored, isHydrated: true });
        return;
      }
    } catch {
      // Fall through to default
    }
    set({ isHydrated: true });
  },

  setPreference: async (theme) => {
    set({ preference: theme });
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  },
}));

export function resolveIsDark(
  preference: Theme,
  systemScheme: 'light' | 'dark' | null | undefined,
): boolean {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return systemScheme === 'dark';
}
