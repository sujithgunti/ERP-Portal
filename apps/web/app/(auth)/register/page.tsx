'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field, PasswordField, ErrorNote, SubmitButton } from '@/components/auth-fields';
import { registerAction, type RegisterState } from './actions';

export default function RegisterPage() {
  const [state, formAction] = useActionState<RegisterState, FormData>(registerAction, {});

  return (
    <>
      <header className="animate-fade-up">
        <h2 className="font-display text-3xl font-normal tracking-tight text-pine">
          Create your account
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          Get access to the production workspace.
        </p>
      </header>

      <form action={formAction} className="mt-8 animate-fade-up space-y-5" style={{ animationDelay: '120ms' }}>
        <Field id="name" label="Full name" autoComplete="name" placeholder="Lakshmi Rao" />
        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@verdant.co"
        />
        <PasswordField label="Password" autoComplete="new-password" />
        <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" />
        <ErrorNote message={state.error} />
        <SubmitButton idleLabel="Create account" busyLabel="Creating…" />
      </form>

      <p className="mt-6 animate-fade-up text-center text-[14px] text-ink-soft" style={{ animationDelay: '220ms' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-pine underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>

      <p
        className="mt-8 animate-fade-up text-center text-[12px] leading-relaxed text-ink-faint"
        style={{ animationDelay: '320ms' }}
      >
        New accounts are created with <span className="font-semibold text-ink-soft">Partner</span>{' '}
        access. An admin can elevate roles later.
      </p>
    </>
  );
}
