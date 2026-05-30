'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useUiStore, type Toast } from '@/lib/store/ui-store';

const VARIANT_STYLES: Record<Toast['variant'], string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  error: 'border-red-300 bg-red-50 text-red-800',
  info: 'border-ink-faint/30 bg-paper-card text-ink',
};

/** Global toast outlet — mount once in the root layout. Reads from the Zustand UI store. */
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-xs flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      onClick={onDismiss}
      className={cn(
        'pointer-events-auto cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium shadow-card transition-all animate-fade-up',
        VARIANT_STYLES[toast.variant],
      )}
    >
      {toast.message}
    </div>
  );
}
