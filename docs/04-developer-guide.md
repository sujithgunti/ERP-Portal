# ERP Portal — Developer Guide

> **Version:** 1.0 · **Date:** 2026-05-29

How to set up, run, and contribute to the ERP Portal.

---

## 1. Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 20 (23.x used) | `node -v` |
| pnpm | 9.x | `pnpm -v` |
| PostgreSQL | 14 | `psql --version` |
| Git | any | `git --version` |

Install pnpm if missing: `npm i -g pnpm@9`.

---

## 2. First-Time Setup

```bash
# 1. Install all workspace deps
pnpm install

# 2. Create the local database
createdb erp_portal           # or: psql -c "CREATE DATABASE erp_portal;"

# 3. Configure env
cp .env.example .env          # then fill values (see below)

# 4. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed initial data (admin user + sample client/order)
pnpm db:seed

# 6. Run everything
pnpm dev
```

After `pnpm dev`: web → http://localhost:3000, api → http://localhost:3001.

### `.env` values (local)
```
DATABASE_URL="postgresql://localhost:5432/erp_portal"
JWT_SECRET="dev-secret-change-me"
AUTH_SECRET="dev-secret-change-me"        # same as JWT_SECRET
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
PORT=3001
```

### First login
The seed creates an admin: **email** `admin@erp.local` / **password** `admin123` (change after first login). Seed also creates one sample client + order to populate the dashboard.

---

## 3. Common Commands

Run from repo root (Turbo fans out across the workspace):

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run web + api in dev (watch mode) |
| `pnpm build` | Build all apps/packages |
| `pnpm lint` | Lint everything |
| `pnpm typecheck` | Type-check everything |
| `pnpm --filter web dev` | Run only the web app |
| `pnpm --filter api dev` | Run only the API |
| `pnpm db:generate` | `prisma generate` (packages/db) |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio (DB GUI) |

> Workspace filters: `--filter web`, `--filter api`, `--filter @erp/db`, etc.

---

## 4. Repo Layout

```
apps/web      → Next.js UI (App Router, Auth.js, role-gated areas)
apps/api      → NestJS REST API (auth, clients, orders, dashboard)
packages/db   → Prisma schema, client, migrations, seed
packages/types→ shared enums + DTO/Zod contracts (Role, Stage, …)
packages/config → shared eslint/tsconfig/prettier presets
docs/         → product spec, tech stack, architecture, this guide, feature map
```

See [03-architecture.md](03-architecture.md) for the full module map.

---

## 5. Adding a Feature — Full Vertical Slice

Example: add a "Reports" resource.

1. **Types** — add DTO/enum to `packages/types` if shared between web and api.
2. **DB** — if new tables: edit `packages/db/prisma/schema.prisma`, then `pnpm db:migrate --name add_reports`.
3. **API** — `cd apps/api`, generate a module:
   ```bash
   nest g module reports && nest g controller reports && nest g service reports
   ```
   - Inject `PrismaService`, write service methods.
   - Guard endpoints: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`.
   - Validate input with a `class-validator` DTO.
4. **Web** — add a page under the correct role area (`apps/web/app/(partner)/partner/reports/page.tsx`); fetch via `lib/api-client.ts` (attaches the JWT).
5. **Verify** — `pnpm typecheck && pnpm lint && pnpm build`; manually exercise the flow.

---

## 6. Conventions

- **Language:** TypeScript everywhere; no `any` without justification.
- **Validation:** never trust client input — validate at the API boundary.
- **Authorization:** every API mutation must be guarded by role. UI gating is not security.
- **Branches:** `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`.
- **Commits:** Conventional Commits — `feat(orders): add daily update endpoint`.
- **Formatting:** Prettier on save; ESLint clean before commit.
- **Shared code:** if web and api both need it, it belongs in `packages/types`.

---

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Can't reach database server` | Is Postgres running? `brew services start postgresql@14`. Check `DATABASE_URL`. |
| `Environment variable not found: DATABASE_URL` | You forgot `.env` or didn't run from the package that loads it. |
| API returns 401 everywhere | `AUTH_SECRET` (web) and `JWT_SECRET` (api) must be the **same** value. |
| Prisma types out of date | `pnpm db:generate` after schema changes. |
| `Module not found: @erp/*` | `pnpm install` to relink workspace packages. |
| Port already in use | Something else on 3000/3001 — kill it or change `PORT`. |
| Turbo cache weirdness | `pnpm turbo run build --force` to bypass cache. |

---

## 8. Definition of Done (per change)

- Type-checks and lints clean.
- API endpoints guarded by the correct role.
- Manually verified the happy path in the running app.
- Migration committed if the schema changed.
