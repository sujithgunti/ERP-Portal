import { auth } from '@/auth';
import { SignOut } from './sign-out';

export async function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-xs text-slate-500">
            {session?.user?.name} · {session?.user?.role}
          </p>
        </div>
        <SignOut />
      </header>
      {children}
    </div>
  );
}
