# Design Specification: Claude Design System Integration & Admin Dashboard Redesign

*   **Date:** 2026-06-25
*   **Status:** Proposed (Approved by User)
*   **Target Workspace:** `d:\open_source\ERP-Portal`

---

## 1. Goal

The objective is to redesign the **Admin Dashboard** module of the ERP Portal and globally integrate the **Claude Design System** aesthetics (warm-canvas, editorial typography, color-blocked card pacing, and coral accents) across the entire frontend (`apps/web`). 

---

## 2. Core Design Tokens & Theme Mapping

We will implement a global mapping strategy in Tailwind so that all existing layout views automatically inherit the new design system theme, reducing manual styling code across secondary pages.

### A. Color Token Mappings (`apps/web/tailwind.config.ts`)
*   `paper` (default floor) ➔ `#faf9f5` (warm cream canvas)
*   `paper-deep` (card backgrounds) ➔ `#efe9de` (light cream `surface-card` equivalent)
*   `paper-card` (elevated cards/inputs) ➔ `#ffffff` (white surface elements)
*   `pine` (main dark accents/titles) ➔ `#181715` (warm dark navy `surface-dark`)
*   `pine-deep` (sidebar/footer backgrounds) ➔ `#12110f` (deep warm ink `surface-dark-soft`)
*   `kraft` (primary action / highlights) ➔ `#cc785c` (brand coral `primary`)
*   `kraft-dark` (active states / labels) ➔ `#a9583e` (darker coral `primary-active`)
*   `ink` (primary copy) ➔ `#141413` (off-black text)
*   `ink-soft` (body copy) ➔ `#3d3d3a` (body text)
*   `ink-faint` (muted text labels / hairline opacity base) ➔ `#6c6a64` (Claude's `muted` color)

### B. Typography & Fonts
We will retain the current Google Font loader (`Fraunces` as display serif and `Hanken Grotesk` as body sans-serif):
*   **Serif display text (`font-display` / Fraunces):** Set default weights to `font-normal` (400) and enforce negative letter tracking (`tracking-[-0.02em]` to `tracking-[-0.03em]`) for headlines to capture the Claude editorial voice.
*   **Sans body text (`font-sans` / Hanken Grotesk):** Enforce `font-normal` (400) for standard paragraphs and `font-medium` (500) for labels.

---

## 3. Component & Layout Redesigns

### A. Shell Components
1.  **Sidebar navigation (`components/admin/sidebar.tsx`):**
    *   Set background to `bg-pine-deep` (solid dark navy `#12110f`).
    *   Display logo as the custom Anthropic 4-spoke/8-spoke radial-spike mark next to the wordmark.
    *   Inactive items: `text-paper/60 hover:text-paper hover:bg-paper/5`.
    *   Active item: `bg-paper/10 text-paper` with a `bg-kraft` (coral) indicator line on the left.
2.  **Header (`apps/web/app/admin/layout.tsx`):**
    *   Use `bg-paper/85` (warm cream) with backdrop-blur.
    *   Thin hairline divider (`border-ink-faint` ➔ `#e6dfd8`).
    *   Badge for user role highlighted in `text-kraft-dark` (coral).

### B. Dashboard Page (`apps/web/app/admin/page.tsx` & `components/admin/ui.tsx`)
1.  **Page Headers:**
    *   Serif title "Today's overview" using `font-display text-3xl font-normal tracking-tight text-pine`.
    *   Eyebrow text "Production Control" in uppercase, wide letter spacing (`tracking-[0.22em] text-ink-soft`).
2.  **Stat Cards (`StatCard`):**
    *   Flat container with thin hairline border (`border-ink-faint`) and white background (`bg-paper-card`).
    *   Large value rendered in `font-display text-4xl font-normal` (serif 400).
    *   Accent stat highlighted in coral (`text-kraft`).
3.  **Live Orders Table & Stage Distribution (`Card`):**
    *   Set card backgrounds to `bg-paper-deep` (slightly darker cream `#efe9de` for page pacing contrast).
    *   Progress bars updated to use `bg-kraft` (coral) for the active fill.
    *   Status badges mapped to soft semantic styling:
        *   `ACTIVE`: `bg-kraft/10 text-kraft-dark ring-kraft/20` (soft coral)
        *   `DELIVERED`: `bg-emerald-50 text-emerald-700 ring-emerald-600/20` (soft green)
        *   `DELAYED`: `bg-red-50 text-red-700 ring-red-600/20` (soft red)

---

## 4. Verification Plan

### Automated Tests
- Run `pnpm typecheck` to verify no typescript compile issues.
- Run `pnpm lint` to ensure no linting warnings or errors.

### Manual Verification
- Deploy locally and visually inspect the dashboard navigation, colors, typography, tables, and buttons.
- Verify page responsiveness at mobile/tablet viewports.
