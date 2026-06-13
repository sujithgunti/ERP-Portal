'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AuthUser } from '@erp/types';
import { Field, PasswordField, ErrorNote, SubmitButton } from '@/components/auth-fields';
import { prismaApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setPending(true);
    try {
      const data = await prismaApi<{ accessToken: string; user: AuthUser }>(
        'POST',
        '/auth/login',
        { email, password },
        { skipAuth: true },
      );
      setAuth(data.accessToken, data.user);
      router.push(HOME_BY_ROLE[data.user.role] ?? '/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Invalid email or password.' : 'Unable to sign in.');
      } else {
        setError('Cannot reach the server. Is the API running?');
      }
      setPending(false);
    }
  }

  return (
    <>
      <header className="animate-fade-up">
        <h2 className="font-display text-3xl font-normal tracking-tight text-pine">Welcome back</h2>
        <p className="mt-2 text-base text-ink-soft">Sign in to your production workspace.</p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 animate-fade-up space-y-5" style={{ animationDelay: '120ms' }}>
        <Field id="email" label="Email address" type="email" autoComplete="email" placeholder="you@verdant.co" />
        <PasswordField
          rightSlot={
            <Link href="#" className="text-sm font-medium text-pine-moss transition-colors hover:text-pine">
              Forgot?
            </Link>
          }
        />
        <ErrorNote message={error} />
        <SubmitButton idleLabel="Sign in" busyLabel="Signing in…" pending={pending} />
      </form>

      <p className="mt-6 animate-fade-up text-center text-sm text-ink-soft" style={{ animationDelay: '220ms' }}>
        New to the portal?{' '}
        <Link href="/register" className="font-semibold text-pine underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <div
        className="mt-10 animate-fade-up rounded-xl border border-ink-faint/20 bg-paper-deep/60 p-4"
        style={{ animationDelay: '320ms' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Demo access</p>
        <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-ink-soft">
          <code className="font-sans">admin@erp.local · admin123</code>
          <code className="font-sans">supervisor@erp.local · supervisor123</code>
          <code className="font-sans">partner@erp.local · partner123</code>
        </div>
      </div>
    </>
  );
}
