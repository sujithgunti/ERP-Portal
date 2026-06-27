'use client';

import { useState } from 'react';
import { Wordmark, XIcon } from '@/components/icons';
import { NavLinks } from '@/components/admin/sidebar';

/** Hamburger + slide-in nav drawer shown below the lg breakpoint. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-faint/25 text-ink-soft hover:bg-paper-deep"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <>
          {/* Overlay — its own fixed element so height never depends on a parent */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-pine-deep/50 backdrop-blur-sm"
          />
          {/* Drawer — fixed full-height left rail (inset-y-0 + h-screen are robust) */}
          <aside className="grain mesh fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-y-auto bg-pine-deep px-4 py-6">
            <div className="flex items-center justify-between px-2">
              <Wordmark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-paper/70 hover:bg-paper/10"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
