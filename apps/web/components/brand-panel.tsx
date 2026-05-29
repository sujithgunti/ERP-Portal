import { Wordmark } from './icons';

const STAGES = ['Paper Procurement', 'Printing', 'Lamination', 'Punching'];

export function BrandPanel() {
  return (
    <section className="grain mesh blueprint relative hidden overflow-hidden lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div
        className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 animate-drift rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(63,125,94,0.45), transparent 70%)' }}
      />

      <div className="relative z-10 animate-fade-up">
        <Wordmark />
      </div>

      <div className="relative z-10 max-w-md">
        <p
          className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-kraft"
          style={{ animationDelay: '120ms' }}
        >
          Production Control
        </p>
        <h1
          className="mt-5 animate-fade-up font-display text-[2.7rem] font-normal leading-[1.05] text-paper"
          style={{ animationDelay: '200ms' }}
        >
          From order to <span className="italic text-kraft-light">delivery</span>, tracked
          end&nbsp;to&nbsp;end.
        </h1>
        <p
          className="mt-5 animate-fade-up text-[15px] leading-relaxed text-paper/70"
          style={{ animationDelay: '300ms' }}
        >
          The single system of record for the floor — clients, deadlines, and every stage of the
          eco-bag production line.
        </p>

        <ul className="mt-9 animate-fade-up space-y-2.5" style={{ animationDelay: '420ms' }}>
          {STAGES.map((stage, i) => (
            <li key={stage} className="flex items-center gap-3 text-sm text-paper/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-kraft/40 text-[11px] font-semibold text-kraft">
                {i + 1}
              </span>
              <span className="font-medium tracking-tight">{stage}</span>
              <span className="h-px flex-1 bg-paper/10" />
            </li>
          ))}
          <li className="pl-9 pt-1 text-xs font-medium uppercase tracking-widest text-paper/35">
            + 5 more stages
          </li>
        </ul>
      </div>

      <div
        className="relative z-10 flex animate-fade-up items-center justify-between text-xs text-paper/45"
        style={{ animationDelay: '540ms' }}
      >
        <span>© {new Date().getFullYear()} Verdant Industries</span>
        <span className="font-display italic">Made of paper. Built to last.</span>
      </div>
    </section>
  );
}
