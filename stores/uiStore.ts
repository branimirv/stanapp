import { create } from 'zustand';
import { TOAST_DURATION_MS } from '@/constants/config';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  onConfirm: (() => void) | null;
}

interface UiState {
  toast: Toast | null;
  isGlobalLoading: boolean;
  confirmDialog: ConfirmDialogState;
  toastTimeoutId: ReturnType<typeof setTimeout> | null;
  showToast: (params: {
    message: string;
    type: ToastType;
    duration?: number;
  }) => void;
  hideToast: () => void;
  setGlobalLoading: (loading: boolean) => void;
  showConfirmDialog: (params: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  }) => void;
  hideConfirmDialog: () => void;
}

const defaultConfirmDialog: ConfirmDialogState = {
  visible: false,
  title: '',
  message: '',
  confirmLabel: 'common.confirm',
  cancelLabel: 'common.cancel',
  destructive: false,
  onConfirm: null,
};

let toastCounter = 0;

export const useUiStore = create<UiState>((set, get) => ({
  toast: null,
  isGlobalLoading: false,
  confirmDialog: defaultConfirmDialog,
  toastTimeoutId: null,

  showToast: ({ message, type, duration = TOAST_DURATION_MS }) => {
    const { toastTimeoutId } = get();
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }

    const id = `toast-${++toastCounter}`;
    const toast: Toast = { id, message, type, duration };

    const timeoutId = setTimeout(() => {
      const current = get();
      if (current.toast?.id === id) {
        set({ toast: null, toastTimeoutId: null });
      }
    }, duration);

    set({ toast, toastTimeoutId: timeoutId });
  },

  hideToast: () => {
    const { toastTimeoutId } = get();
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    set({ toast: null, toastTimeoutId: null });
  },

  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  showConfirmDialog: ({
    title,
    message,
    confirmLabel = 'common.confirm',
    cancelLabel = 'common.cancel',
    destructive = false,
    onConfirm,
  }) =>
    set({
      confirmDialog: {
        visible: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        destructive,
        onConfirm,
      },
    }),

  hideConfirmDialog: () => set({ confirmDialog: defaultConfirmDialog }),
}));
