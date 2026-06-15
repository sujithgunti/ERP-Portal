# Changelog

All notable changes to the ERP Portal are documented here.

## [0.2.0] - 2026-06-15

### Orders
- Production tracking is now an **independent checkbox checklist** (replaced the old
  forward-only stage dropdown). Any stage can be completed in any order without affecting others.
- **Optional note** can be attached when completing a stage, recorded in the dated history timeline.
- **Auto-deliver**: ticking all 9 production stages automatically marks the order Delivered;
  unticking one reverts it to Active/Delayed.
- Removed the old "Add update" dropdown modal and the manual "Mark delivered" button.
- **Pipeline reordered** — Designing now comes before Printing
  (`Paper Procurement → Designing → Printing → …`).
- Added **paper type** to orders: a fixed dropdown of **Brown / Cyber XL / Viva Liner**, shown on
  the order detail and in the orders report; invalid values are rejected by the API.
- Progress % is now derived from the number of completed stages.

### Clients
- Added an optional **Address** field. Clients now have four fields: Name, GST (optional),
  Phone (optional), Address (optional). No email field.
- Added a **Delete** option, guarded to block deletion of a client that still has orders.

### Dashboard
- Recent orders is now the **full orders list** with a per-order progress bar (removed the
  "View all" link and the 6-row cap; long lists scroll).
- Added a **monthly deadline calendar** — orders plotted on their deadline date (overdue in red,
  delivered in green) with month-to-month navigation.

### Reports
- Added a **deadline calendar view** to the Orders report (Table / Calendar toggle).
- Added a **Paper** column to the orders table.

### Responsiveness
- Added a **mobile navigation drawer**: a hamburger (☰) on small screens opens a full-height
  slide-in left menu with a dimmed overlay (previously the menu disappeared entirely).
- The admin header condenses gracefully on small screens.
- All data tables now scroll horizontally instead of overflowing/clipping on narrow screens.

### Environment & setup
- Switched to **per-app environment files** (`apps/api/.env`, `apps/web/.env.local`); removed the
  root `.env`. Nest's ConfigModule and the Prisma CLI load `apps/api/.env`; Next loads
  `apps/web/.env.local`.
- Corrected dev ports to match the code: **API `:8000`**, **web `:8001`** (CORS allows the web origin).
- Local PostgreSQL setup documented; schema synced via `prisma db push`; database seeded
  (sample data now includes paper type and client address).

### Fixes
- Fixed dashboard crash (`PRODUCTION_STAGES` undefined) caused by a stale `@erp/types` build /
  Next `.next` cache.
- Fixed the mobile menu rendering as a small box at the top (drawer height CSS bug — now a
  full-height `fixed inset-y-0` left rail).
- Removed the stale, broken `contact` field everywhere (seed + architecture doc).
- Fixed broken root `db:*` scripts and installed the missing `jspdf` / `jspdf-autotable`
  dependencies so typecheck and build pass.
- Corrected stale "9-stage" → "10-stage" references and a 9-column stage grid.

### Docs
- Rewrote `README.md` (prerequisites, per-app env, ports, modules, 10-stage pipeline, run/deploy).
- Updated `docs/01-product-spec.md` and `docs/03-architecture.md` to match the current data model.
