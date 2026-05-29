import { BrandPanel } from '@/components/brand-panel';
import { Wordmark } from '@/components/icons';

// Shared chrome for all auth flows (login, register): brand panel + form column.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <BrandPanel />
      <section className="grain relative flex flex-1 items-center justify-center bg-paper px-6 py-12 sm:px-10">
        <div className="relative z-10 w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <Wordmark dark />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
