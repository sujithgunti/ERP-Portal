'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field, PasswordField, ErrorNote, SubmitButton } from '@/components/auth-fields';
import { loginAction, type LoginState } from './actions';

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <>
      <header className="animate-fade-up">
        <h2 className="font-display text-3xl font-normal tracking-tight text-pine">Welcome back</h2>
        <p className="mt-2 text-[15px] text-ink-soft">Sign in to your production workspace.</p>
      </header>

      <form action={formAction} className="mt-8 animate-fade-up space-y-5" style={{ animationDelay: '120ms' }}>
        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@verdant.co"
        />
        <PasswordField
          rightSlot={
            <Link
              href="#"
              className="text-[13px] font-medium text-pine-moss transition-colors hover:text-pine"
            >
              Forgot?
            </Link>
          }
        />
        <ErrorNote message={state.error} />
        <SubmitButton idleLabel="Sign in" busyLabel="Signing in…" />
      </form>

      <p className="mt-6 animate-fade-up text-center text-[14px] text-ink-soft" style={{ animationDelay: '220ms' }}>
        New to the portal?{' '}
        <Link href="/register" className="font-semibold text-pine underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <div
        className="mt-10 animate-fade-up rounded-xl border border-ink-faint/20 bg-paper-deep/60 p-4"
        style={{ animationDelay: '320ms' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Demo access</p>
        <div className="mt-2 grid grid-cols-1 gap-1 text-[13px] text-ink-soft">
          <code className="font-sans">admin@erp.local · admin123</code>
          <code className="font-sans">supervisor@erp.local · supervisor123</code>
          <code className="font-sans">partner@erp.local · partner123</code>
        </div>
      </div>
    </>
  );
}
