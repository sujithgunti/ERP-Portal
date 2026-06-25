# Claude Design Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Admin Dashboard module of the ERP Portal and globally integrate the Claude Design System warm cream/coral theme and editorial typography.

**Architecture:** Map the existing design tokens (`paper`, `pine`, `kraft`, `ink`) in the Tailwind configuration directly to their Claude counterparts, then refine the Layout Shell, Header, Sidebar, and Dashboard UI components to use clean, hairline-bordered layouts, coral progress bars, and serif display headings.

**Tech Stack:** Next.js 15, Tailwind CSS, Google Fonts (Fraunces + Hanken Grotesk).

---

### Task 1: Color Configuration Mapping in Tailwind

**Files:**
- Modify: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Replace color values in tailwind.config.ts**
  Modify `apps/web/tailwind.config.ts` to update the colors under `theme.extend.colors` to match the Claude Design System values.
  ```typescript
      colors: {
        pine: {
          DEFAULT: '#181715',
          deep: '#12110f',
          800: '#181715e0',
          700: '#1a1a18',
          600: '#252320',
          moss: '#5db8a6',
        },
        kraft: {
          DEFAULT: '#cc785c',
          light: '#e6dfd8',
          dark: '#a9583e',
        },
        paper: {
          DEFAULT: '#faf9f5',
          deep: '#efe9de',
          card: '#ffffff',
        },
        ink: {
          DEFAULT: '#141413',
          soft: '#3d3d3a',
          faint: '#6c6a64',
        },
      },
  ```
- [ ] **Step 2: Run verification (typecheck and build)**
  Run: `pnpm typecheck`
  Expected: PASS with no compilation errors.
- [ ] **Step 3: Stage changes for review**
  Run: `git add apps/web/tailwind.config.ts`

---

### Task 2: Global CSS Updates

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Update variables and display fonts in globals.css**
  Modify `apps/web/app/globals.css` to update `--paper` and `--pine` variables, add font display class tracking defaults, and update `.mesh` background gradient to use warm dark navy and coral:
  ```css
  :root {
    --paper: #faf9f5;
    --pine: #181715;
  }
  
  .font-display {
    font-family: var(--font-display), Georgia, serif;
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  
  .mesh {
    background-color: #12110f;
    background-image:
      radial-gradient(60% 50% at 20% 15%, rgba(204, 120, 92, 0.15) 0%, transparent 60%),
      radial-gradient(50% 45% at 85% 30%, rgba(230, 223, 216, 0.1) 0%, transparent 55%),
      radial-gradient(70% 60% at 70% 95%, rgba(18, 17, 15, 0.95) 0%, transparent 70%),
      linear-gradient(160deg, #181715 0%, #12110f 100%);
  }
  ```
- [ ] **Step 2: Run verification**
  Run: `pnpm typecheck`
  Expected: PASS
- [ ] **Step 3: Stage changes**
  Run: `git add apps/web/app/globals.css`

---

### Task 3: Logo & Wordmark Refactoring

**Files:**
- Modify: `apps/web/components/icons.tsx`

- [ ] **Step 1: Update Logo and Wordmark SVGs in components/icons.tsx**
  Replace `Logo` and `Wordmark` definitions in `apps/web/components/icons.tsx` to render the custom 4-spoke/8-spoke radial-spike mark.
  ```typescript
  export function Logo({ className = '' }: { className?: string; dark?: boolean }) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className} aria-hidden>
        <path d="M12 3v18M3 12h18" />
        <path d="M5.64 5.64l12.72 12.72M5.64 18.36L18.36 5.64" strokeWidth="1.8" opacity="0.65" />
      </svg>
    );
  }
  
  export function Wordmark({ dark = false }: { dark?: boolean }) {
    return (
      <div className="flex items-center gap-2.5">
        <Logo className={dark ? 'text-pine' : 'text-kraft'} />
        <span
          className={`font-display text-lg font-normal tracking-tight ${dark ? 'text-pine' : 'text-paper'}`}
        >
          Verdant<span className={dark ? 'text-kraft-dark' : 'text-kraft'}>ERP</span>
        </span>
      </div>
    );
  }
  ```
- [ ] **Step 2: Run verification**
  Run: `pnpm typecheck`
  Expected: PASS
- [ ] **Step 3: Stage changes**
  Run: `git add apps/web/components/icons.tsx`

---

### Task 4: Sidebar Navigation UI Update

**Files:**
- Modify: `apps/web/components/admin/sidebar.tsx`

- [ ] **Step 1: Update sidebar.tsx layout and styles**
  Modify active/inactive states in `NavLinks` and spacing inside `Sidebar` to match the warm dark navy layout shell:
  ```typescript
  export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    return (
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-paper/10 text-paper' : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-kraft" />
              ) : null}
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }
  ```
- [ ] **Step 2: Run verification**
  Run: `pnpm typecheck`
  Expected: PASS
- [ ] **Step 3: Stage changes**
  Run: `git add apps/web/components/admin/sidebar.tsx`

---

### Task 5: Admin Layout Header Customization

**Files:**
- Modify: `apps/web/app/admin/layout.tsx`

- [ ] **Step 1: Modify layout.tsx header styles**
  Modify `AdminShell` top header in `apps/web/app/admin/layout.tsx` to align colors with new tokens (e.g. user role badge mapped to `text-kraft-dark`, avatar `bg-pine text-paper` etc.):
  ```typescript
  <p className="text-xs uppercase tracking-wide text-kraft-dark">{user?.role}</p>
  ```
- [ ] **Step 2: Run verification**
  Run: `pnpm typecheck`
  Expected: PASS
- [ ] **Step 3: Stage changes**
  Run: `git add apps/web/app/admin/layout.tsx`

---

### Task 6: UI Components Enhancements (StatCard, ProgressBar, StatusBadge)

**Files:**
- Modify: `apps/web/components/admin/ui.tsx`

- [ ] **Step 1: Redesign UI helper classes**
  Modify `StatCard`, `ProgressBar`, `StatusBadge`, and `Card` in `apps/web/components/admin/ui.tsx`:
  ```typescript
  export function ProgressBar({ value }: { value: number }) {
    return (
      <div className="h-2 w-full overflow-hidden rounded-full bg-paper-deep">
        <div
          className="h-full rounded-full bg-kraft transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    );
  }
  
  export function StatCard({
    label,
    value,
    accent = false,
  }: {
    label: string;
    value: number | string;
    accent?: boolean;
  }) {
    return (
      <div
        className={`rounded-2xl border bg-paper-card p-5 ${
          accent ? 'border-kraft/60 shadow-sm' : 'border-ink-faint/60'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft/75">
          {label}
        </p>
        <p
          className={`mt-2 font-display text-4xl font-normal tracking-tight ${
            accent ? 'text-kraft' : 'text-pine'
          }`}
        >
          {value}
        </p>
      </div>
    );
  }
  
  const STATUS_STYLES: Record<OrderStatus, string> = {
    ACTIVE: 'bg-kraft/10 text-kraft-dark ring-kraft/20',
    DELAYED: 'bg-red-50 text-red-700 ring-red-600/20',
    DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  };
  
  export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
      <div className={`rounded-2xl border border-ink-faint/60 bg-paper-card ${className}`}>
        {children}
      </div>
    );
  }
  ```
- [ ] **Step 2: Run verification**
  Run: `pnpm typecheck`
  Expected: PASS
- [ ] **Step 3: Stage changes**
  Run: `git add apps/web/components/admin/ui.tsx`

---

### Task 7: Admin Dashboard Page Polishing

**Files:**
- Modify: `apps/web/app/admin/page.tsx`

- [ ] **Step 1: Refine page headers and table stickiness**
  Modify eyebrow and title class styling in `apps/web/app/admin/page.tsx` to match the editorial tracking constraints, and update the sticky head bg of the Orders table to use `bg-paper-deep`:
  ```typescript
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">Production Control</p>
        <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-pine">Today&apos;s overview</h1>
      </div>
  ```
  And the table row:
  ```typescript
  <thead className="sticky top-0 z-10 bg-paper-deep text-xs uppercase tracking-wide text-ink-soft/75">
  ```
- [ ] **Step 2: Run verification (typecheck and build)**
  Run: `pnpm typecheck && pnpm build`
  Expected: PASS with no compilation/build errors.
- [ ] **Step 3: Stage changes**
  Run: `git add apps/web/app/admin/page.tsx`
