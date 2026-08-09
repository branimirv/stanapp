import { create } from 'zustand';

/**
 * Boot overlay visibility. A store (not React state) so login can raise the
 * cover synchronously in `markPostAuthTransition` — before NativeTabs mount
 * and before the auth listener runs.
 */
interface BootOverlayState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

export const useBootOverlayStore = create<BootOverlayState>((set) => ({
  // Cold start begins covered; useBootstrap releases via hide().
  visible: true,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));
