import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'sweet';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, default 3200
  icon?: string;
  createdAt: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (newToast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duration = newToast.duration ?? 3200;

    const item: ToastItem = {
      ...newToast,
      id,
      duration,
      createdAt: Date.now(),
    };

    set((state) => ({
      // Keep at most 4 active toasts stacked nicely on the top left
      toasts: [item, ...state.toasts.slice(0, 3)],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));

// Quick convenience helper API
export const toast = {
  success: (message: string, title?: string, duration = 3200, icon?: string) =>
    useToastStore.getState().addToast({ type: 'success', message, title, duration, icon }),

  error: (message: string, title?: string, duration = 3500, icon?: string) =>
    useToastStore.getState().addToast({ type: 'error', message, title, duration, icon }),

  info: (message: string, title?: string, duration = 3000, icon?: string) =>
    useToastStore.getState().addToast({ type: 'info', message, title, duration, icon }),

  warning: (message: string, title?: string, duration = 3500, icon?: string) =>
    useToastStore.getState().addToast({ type: 'warning', message, title, duration, icon }),

  sweet: (message: string, title = 'Sweet!', duration = 3200, icon = '🍬') =>
    useToastStore.getState().addToast({ type: 'sweet', message, title, duration, icon }),
};
