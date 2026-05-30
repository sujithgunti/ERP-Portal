import { create } from 'zustand';

/**
 * Global client-side UI store (Zustand).
 *
 * Holds only cross-component CLIENT state — toasts and the mobile sidebar.
 * Server data (orders, clients, dashboard) is NOT kept here: it lives on the
 * server (RSC + server actions + revalidatePath). Don't mirror server data
 * into this store.
 */

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface UiState {
  // Toasts
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: number) => void;

  // Mobile sidebar drawer
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

let nextToastId = 1;

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  addToast: (message, variant = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: nextToastId++, message, variant }] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

/** Convenience hook to fire a toast: const toast = useToast(); toast('Saved', 'success'). */
export const useToast = () => useUiStore((s) => s.addToast);
