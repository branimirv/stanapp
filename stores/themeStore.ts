import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Theme } from '@/types/app.types';

export const THEME_STORAGE_KEY = '@stanapp/theme';

interface ThemeState {
  preference: Theme;
  isHydrated: boolean;
  /** True once a theme was read from storage or explicitly set by the user. */
  hasStoredPreference: boolean;
  hydrate: () => Promise<void>;
  setPreference: (theme: Theme) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  isHydrated: false,
  hasStoredPreference: false,

  hydrate: async () => {
    if (get().isHydrated) return;

    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      // User may have changed theme while we were reading storage — keep their choice.
      if (get().hasStoredPreference) {
        set({ isHydrated: true });
        return;
      }

      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ preference: stored, isHydrated: true, hasStoredPreference: true });
        return;
      }
    } catch {
      // Fall through to default
    }

    if (get().hasStoredPreference) {
      set({ isHydrated: true });
      return;
    }

    set({ isHydrated: true });
  },

  setPreference: async (theme) => {
    set({ preference: theme, hasStoredPreference: true });
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  },
}));

export function resolveIsDark(
  preference: Theme,
  systemScheme: 'light' | 'dark' | 'unspecified' | null | undefined,
): boolean {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return systemScheme === 'dark';
}
