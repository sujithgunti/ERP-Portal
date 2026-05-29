import { signOut } from '@/auth';

export function SignOut() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}
    >
      <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
        Sign out
      </button>
    </form>
  );
}
