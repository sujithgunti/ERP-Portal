# ERP Portal

Order & production tracking ERP for an eco-bag manufacturing factory.
Role-based (Admin / Supervisor / Partner) tracking of client orders through a **10-stage**
production pipeline, plus daily cash book, worker attendance, machine work-efficiency, and reports.

---

## Stack

Turborepo + pnpm monorepo · **Next.js 15** (web, App Router) · **NestJS 11** (api, REST) ·
**Prisma 6 + PostgreSQL** · Auth.js (JWT, RBAC) · Zustand (web state) · Tailwind CSS.

```
apps/web        Next.js 15 App Router + Auth.js + Tailwind  (dev server :8001)
apps/api        NestJS REST API (auth, clients, orders, dashboard, expenses,
                workers/attendance, machines/work-efficiency, reports, costing)
                Prisma schema + migrations + seed live here (apps/api/prisma)
packages/types  Shared enums + DTO contracts (@erp/types)
packages/config shared tsconfig presets
docs/           product spec, tech stack, architecture, dev guide, feature map
```

> Note: the Prisma schema is at `apps/api/prisma/schema.prisma`. The root `pnpm db:*`
> scripts proxy to the `api` package.

---

## Prerequisites

- **Node.js ≥ 20**
- **pnpm 9** (`npm install -g pnpm@9`)
- **PostgreSQL ≥ 14** running locally (or a connection string to a remote instance)

---

## Quick start

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Create the database (adjust to your Postgres setup)
createdb erp_portal
#   …or with psql:  psql -U postgres -c "CREATE DATABASE erp_portal;"

# 3. Configure environment — each app loads its OWN .env (Turborepo convention)
cp apps/api/.env.example apps/api/.env        # DATABASE_URL, JWT_SECRET, PORT, WEB_ORIGIN
cp apps/web/.env.example apps/web/.env.local  # AUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_API_URL
#   Edit both — set DATABASE_URL, and make JWT_SECRET (api) === AUTH_SECRET (web).

# 4. Generate the Prisma client, push the schema to the DB, and seed demo data
pnpm db:generate
pnpm db:push      # syncs schema → database (this project uses db push, not migrations)
pnpm db:seed

# 5. Start everything (web + api together via Turborepo)
pnpm dev
```

After `pnpm dev`:

- **Web app:** http://localhost:8001
- **API:** http://localhost:8000

### Seed logins

Password is `<role>123` (e.g. `admin123`):

| Email                  | Role       | Password     |
| ---------------------- | ---------- | ------------ |
| `admin@erp.local`      | Admin      | `admin123`      |
| `supervisor@erp.local` | Supervisor | `supervisor123` |
| `partner@erp.local`    | Partner    | `partner123`    |

Only **Admin** can create/edit/delete data. Supervisor verifies updates; Partner is read-only.

---

## Environment variables

Each app loads its own env file (Turborepo convention) — there is **no root `.env`**:

- **`apps/api/.env`** — loaded by Nest's `ConfigModule` and the Prisma CLI (both run with `cwd = apps/api`).
- **`apps/web/.env.local`** — auto-loaded by Next.js.

| Variable              | File               | Notes                                                      |
| --------------------- | ------------------ | --------------------------------------------------------- |
| `DATABASE_URL`        | apps/api/.env      | Postgres connection string.                               |
| `JWT_SECRET`          | apps/api/.env      | JWT signing secret. **Must equal `AUTH_SECRET`.**         |
| `PORT`                | apps/api/.env      | API port (default `8000`).                                |
| `WEB_ORIGIN`          | apps/api/.env      | CORS-allowed web origin (default `http://localhost:8001`). |
| `AUTH_SECRET`         | apps/web/.env.local| Auth.js secret. **Must equal `JWT_SECRET`.**              |
| `NEXTAUTH_URL`        | apps/web/.env.local| Web origin — `http://localhost:8001` in dev.              |
| `NEXT_PUBLIC_API_URL` | apps/web/.env.local| API origin — `http://localhost:8000` in dev.              |

---

## Useful scripts (run from repo root)

| Command             | What it does                                              |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Run web (:8001) and api (:8000) together.               |
| `pnpm build`        | Build all packages/apps.                                 |
| `pnpm typecheck`    | Type-check every workspace.                              |
| `pnpm lint`         | Lint every workspace.                                    |
| `pnpm db:generate`  | Generate the Prisma client.                             |
| `pnpm db:push`      | Sync the Prisma schema to the database (`prisma db push`). |
| `pnpm db:migrate`   | Create/apply dev migrations (`prisma migrate dev`) — only if you adopt migrations. |
| `pnpm db:seed`      | Seed demo users + sample data.                          |
| `pnpm db:studio`    | Open Prisma Studio to browse the database.              |

Run a single app: `pnpm --filter web dev` or `pnpm --filter api dev`.

---

## Modules

| Area               | Web route               | Description                                                                 |
| ------------------ | ----------------------- | --------------------------------------------------------------------------- |
| **Dashboard**      | `/admin`                | Stat cards, order-wise **stage distribution** (left), full **orders list** with progress bars, and a **monthly deadline calendar**. |
| **Orders**         | `/admin/orders`         | Create/edit orders with specs (size, GSM, **paper type**, printing, handle, lamination), track through 10 stages, post daily updates, costing. |
| **Clients**        | `/admin/clients`        | Name, GST (optional), Phone (optional), **Address** (optional). Create / edit / **delete** (delete blocked when the client has orders). |
| **Expenses**       | `/admin/expenses`       | Daily cash book — **incoming / outgoing** entries with per-day totals (incoming, outgoing, net). |
| **Attendance**     | `/admin/attendance`     | Per-worker daily attendance with a **time period** (e.g. 10:00 AM → 4:00 PM) and duration. |
| **Work Efficiency**| `/admin/work-efficiency`| **Machines** management + daily **bags produced per machine**, with monthly summaries. |
| **Reports**        | `/admin/reports`        | Date-ranged Orders / Expenses / Work-Efficiency reports; Orders has a **calendar view** of deadlines; export to PDF. |
| **Manage Roles**   | `/admin/roles`          | Admin creates login users and assigns roles.                                |

### Production pipeline (10 stages, in order)

`Paper Procurement → Designing → Printing → Lamination → Punching →
In-House Manufacturing → Handle Pasting → Packing → Dispatch → Delivered`

---

## Production / deployment

The app is deployed to a VPS (`erp.buildnweb.in`) with auto-deploy on push to `main`
(see `docs/` and the deploy workflow). For a manual production build:

```bash
pnpm build
pnpm --filter api db:push      # sync schema to the production database
pnpm --filter api start        # serves the API
pnpm --filter web start        # serves the web app on :8001
```

---

## Docs

- [Product Spec](docs/01-product-spec.md)
- [Tech Stack](docs/02-tech-stack.md)
- [Architecture](docs/03-architecture.md)
- [Developer Guide](docs/04-developer-guide.md)
- [Feature Map](docs/05-feature-map.md)
