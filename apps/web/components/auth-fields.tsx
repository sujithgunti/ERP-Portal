'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Arrow, Eye, EyeOff } from './icons';

export function Field({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  required = true,
  rightSlot,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
          {label}
        </label>
        {rightSlot}
      </div>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}

export function PasswordField({
  id = 'password',
  label = 'Password',
  autoComplete = 'current-password',
  rightSlot,
}: {
  id?: string;
  label?: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          placeholder="••••••••"
          className="field pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-faint transition-colors hover:text-pine"
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-[13px] font-medium text-red-700">
      <span className="text-base leading-none">⚠</span>
      {message}
    </p>
  );
}

export function SubmitButton({ idleLabel, busyLabel }: { idleLabel: string; busyLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-pine px-4 py-3.5 text-[15px] font-semibold text-paper shadow-card transition-all duration-200 hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden
      />
      {pending ? busyLabel : idleLabel}
      {!pending && <Arrow />}
    </button>
  );
}
