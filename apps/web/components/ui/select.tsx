'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from '@/components/icons';

/**
 * Global dropdown — a clean popover replacing the native <select>.
 * Controlled: `value` + `onChange`. Pass `name` to also emit a hidden input so
 * FormData-based forms keep working. Dependency-free; design-system styled.
 */

export interface SelectOption {
  value: string;
  label: string;
}

export function DropdownOptionSelector({
  value,
  onChange,
  options,
  name,
  placeholder = 'Select…',
  id,
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="field flex w-full items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={selected ? 'text-ink' : 'text-ink-faint'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`shrink-0 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 max-h-64 w-full min-w-[10rem] overflow-y-auto rounded-xl border border-ink-faint/15 bg-paper-card p-1.5 shadow-card">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active ? 'bg-pine/8 font-semibold text-pine' : 'text-ink hover:bg-paper-deep'
                }`}
              >
                <span>{opt.label}</span>
                {active ? <Check className="text-pine" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
