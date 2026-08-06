import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { TabBarLabelMode } from '@/types/app.types';

export const TAB_BAR_LABEL_MODE_KEY = '@stanapp/tab_bar_label_mode';

const DEFAULT_MODE: TabBarLabelMode = 'iconAndLabel';

function isTabBarLabelMode(value: string | null): value is TabBarLabelMode {
  return value === 'iconAndLabel' || value === 'iconOnly';
}

interface TabBarState {
  labelMode: TabBarLabelMode;
  isHydrated: boolean;
  /** Hide NativeTabs chrome (e.g. while a full-screen sheet/modal is open). */
  chromeHidden: boolean;
  hydrate: () => Promise<void>;
  setLabelMode: (mode: TabBarLabelMode) => Promise<void>;
  setChromeHidden: (hidden: boolean) => void;
}

export const useTabBarStore = create<TabBarState>((set, get) => ({
  labelMode: DEFAULT_MODE,
  isHydrated: false,
  chromeHidden: false,

  hydrate: async () => {
    if (get().isHydrated) return;

    try {
      const stored = await AsyncStorage.getItem(TAB_BAR_LABEL_MODE_KEY);
      if (isTabBarLabelMode(stored)) {
        set({ labelMode: stored, isHydrated: true });
        return;
      }
    } catch {
      // Fall through to default
    }

    set({ isHydrated: true });
  },

  setLabelMode: async (mode) => {
    set({ labelMode: mode });
    await AsyncStorage.setItem(TAB_BAR_LABEL_MODE_KEY, mode);
  },

  setChromeHidden: (hidden) => {
    set({ chromeHidden: hidden });
  },
}));
