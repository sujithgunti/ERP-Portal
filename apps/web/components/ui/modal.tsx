'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { XIcon } from '@/components/icons';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Visual style of the close button in the top-right of the modal. */
export type CloseButtonVariant = 'plain' | 'circle';

export interface ModalProps {
  /** Controls visibility. */
  open: boolean;
  /** Fired when the user requests to close (X button, ESC, backdrop). */
  onClose: () => void;
  /** Optional title rendered in the header block. */
  title?: ReactNode;
  /** Optional subtitle rendered under the title. */
  subtitle?: ReactNode;
  /** Modal body. */
  children: ReactNode;
  /** Style of the top-right close button. */
  closeVariant?: CloseButtonVariant;
  /** Maximum width preset. */
  size?: ModalSize;
  /** Click on the backdrop closes the modal. Default true. */
  dismissOnBackdrop?: boolean;
  /** Pressing ESC closes the modal. Default true. */
  dismissOnEscape?: boolean;
  /** Hide the close button entirely (e.g. mandatory consent flows). */
  hideCloseButton?: boolean;
  /** Additional class names for the dialog card. */
  className?: string;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

/**
 * Global, accessible modal / dialog primitive.
 *
 * Behaviour:
 *   - Renders into `document.body` via React portal so it escapes any parent
 *     stacking context or overflow clip.
 *   - Locks `body` scroll while open.
 *   - Closes on ESC and backdrop click (both opt-out).
 *   - Auto-focuses the dialog so keyboard users land inside it.
 *   - `aria-modal` + `aria-labelledby` for assistive tech.
 *
 * Compose specific dialogs on top of this primitive — they only own their
 * content, not the chrome.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  closeVariant = 'plain',
  size = 'md',
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  hideCloseButton = false,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC handler.
  useEffect(() => {
    if (!open || !dismissOnEscape) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, dismissOnEscape, onClose]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Auto-focus the dialog so keyboard nav lands inside.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;
  if (typeof document === 'undefined') return null; // SSR safety

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pine-deep/55 backdrop-blur-sm"
        onClick={dismissOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={cn(
          'relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-paper-card p-6 shadow-card outline-none md:p-8',
          SIZE_CLASSES[size],
          className,
        )}
      >
        {!hideCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              'absolute right-4 top-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-moss',
              closeVariant === 'circle'
                ? 'flex h-7 w-7 items-center justify-center rounded-full bg-pine text-paper hover:bg-pine-deep'
                : 'p-1 text-ink-faint hover:text-pine',
            )}
          >
            <XIcon
              className={closeVariant === 'circle' ? 'h-4 w-4' : 'h-5 w-5'}
              strokeWidth={closeVariant === 'circle' ? 2.75 : 2}
            />
          </button>
        )}

        {(title || subtitle) && (
          <header className="mb-6 pr-8">
            {title && (
              <h2 id="modal-title" className="font-display text-2xl font-normal tracking-tight text-pine">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          </header>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
}
