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

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm') ?? '');

    if (!name || !email || !password) return setError('All fields are required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setPending(true);
    try {
      const data = await prismaApi<{ accessToken: string; user: AuthUser }>(
        'POST',
        '/auth/register',
        { name, email, password },
        { skipAuth: true },
      );
      setAuth(data.accessToken, data.user);
      router.push(HOME_BY_ROLE[data.user.role] ?? '/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 409 ? 'That email is already registered.' : 'Could not create your account.');
      } else {
        setError('Cannot reach the server. Is the API running?');
      }
      setPending(false);
    }
  }

  return (
    <>
      <header className="animate-fade-up">
        <h2 className="font-display text-3xl font-normal tracking-tight text-pine">Create your account</h2>
        <p className="mt-2 text-base text-ink-soft">Get access to the production workspace.</p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 animate-fade-up space-y-5" style={{ animationDelay: '120ms' }}>
        <Field id="name" label="Full name" autoComplete="name" placeholder="Lakshmi Rao" />
        <Field id="email" label="Email address" type="email" autoComplete="email" placeholder="you@verdant.co" />
        <PasswordField label="Password" autoComplete="new-password" />
        <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" />
        <ErrorNote message={error} />
        <SubmitButton idleLabel="Create account" busyLabel="Creating…" pending={pending} />
      </form>

      <p className="mt-6 animate-fade-up text-center text-sm text-ink-soft" style={{ animationDelay: '220ms' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-pine underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      <p
        className="mt-8 animate-fade-up text-center text-[12px] leading-relaxed text-ink-faint"
        style={{ animationDelay: '320ms' }}
      >
        New accounts are created with <span className="font-semibold text-ink-soft">Partner</span> access. An admin
        can elevate roles later.
      </p>
    </>
  );
}
