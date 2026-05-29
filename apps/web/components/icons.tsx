export function Logo({ dark = false }: { dark?: boolean }) {
  const stroke = dark ? '#0e2a20' : '#f6f2e9';
  const accent = dark ? '#a07f4c' : '#c8a26a';
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
      <rect x="1" y="1" width="32" height="32" rx="9" stroke={stroke} strokeWidth="1.5" opacity="0.55" />
      <path
        d="M17 8c5 0 9 3.6 9 9 0 5-4 9-9 9-1.6 0-3-.4-4.3-1.1"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M17 8c-5 0-9 3.6-9 9 0 2.4.9 4.5 2.4 6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M17 26V8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Logo dark={dark} />
      <span
        className={`font-display text-lg font-medium tracking-tight ${dark ? 'text-pine' : 'text-paper'}`}
      >
        Verdant<span className={dark ? 'text-kraft-dark' : 'text-kraft'}>ERP</span>
      </span>
    </div>
  );
}

export function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.4 4.2M6.1 6.1A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.9-.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
