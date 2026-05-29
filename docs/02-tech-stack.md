# ERP Portal — Tech Stack

> **Version:** 1.0 · **Date:** 2026-05-29

This document records every technology in the stack, why it was chosen, and what was rejected.

---

## 1. Stack at a Glance

| Layer | Tool | Version (target) |
|-------|------|------------------|
| Monorepo build | **Turborepo** | latest (^2) |
| Package manager | **pnpm** workspaces | 9.9 |
| Runtime | **Node.js** | 23.x (engines: >=20) |
| Language | **TypeScript** | ^5.x |
| Frontend | **Next.js** (App Router) | 15.x |
| UI | **Tailwind CSS** + **shadcn/ui** | latest |
| Backend | **NestJS** (REST) | 11.x |
| ORM | **Prisma** | ^6.x |
| Database | **PostgreSQL** | 14 (local) |
| Auth | **Auth.js (NextAuth v5)** + JWT | latest |
| Lint/format | **ESLint** + **Prettier** | latest |
| Validation | **Zod** (shared) + **class-validator** (Nest DTOs) | latest |

---

## 2. Why This Stack

### Frontend — Next.js 15 (App Router)
- React Server Components + route handlers give fast, SEO-irrelevant-but-snappy dashboards.
- App Router layouts map cleanly to **role-gated areas** (`/admin`, `/supervisor`, `/partner`).
- First-class Auth.js integration (middleware-based route protection).
- **Rejected:** plain React + Vite SPA — would need a separate auth/session layer and SSR is useful for a data-heavy admin tool.

### Backend — NestJS (REST)
- Opinionated modular structure (modules / controllers / services / guards) fits an ERP that will grow many resources.
- Built-in **Guards + decorators** make RBAC (`@Roles()`, `RolesGuard`) clean and testable.
- Dependency injection + DTO validation (`class-validator`) keep boundaries tight.
- A standalone API earns its keep in Phase 2/3 (background jobs: delay alerts, voice→WhatsApp automation, AI tasks) without bloating the web app.
- **Rejected:** Next.js route handlers as the only backend — fine for MVP but couples async/worker concerns to the web runtime. Express/Fastify bare — less structure than Nest for a multi-module domain.

### Database — PostgreSQL 14
- Relational domain (orders ↔ clients ↔ daily updates ↔ stages) is a natural fit.
- Strong constraints, transactions, and reporting (window functions for delay analytics later).
- Already installed locally (`/opt/homebrew/var/postgresql@14`).

### ORM — Prisma
- Excellent DX, type-safe client, declarative schema, painless migrations.
- One schema in `packages/db` shared by the API.
- **Rejected:** Drizzle — lighter and SQL-first, but Prisma's migration tooling and ergonomics win for a relational ERP with many tables.

### Auth — Auth.js (NextAuth v5) + JWT
- Self-hosted, free, no vendor lock-in.
- Credentials provider for the factory's internal users (Admin/Supervisor/Partner).
- See §3 for how it bridges to NestJS.
- **Rejected:** Clerk (hosted, paid, vendor dependency); Lucia/custom (more maintenance).

### Monorepo — Turborepo + pnpm
- Single repo for `web`, `api`, and shared `db` / `types` / `config` packages.
- Turbo caches builds and runs tasks across the graph (`dev`, `build`, `lint`, `typecheck`).
- pnpm workspaces give fast, disk-efficient installs and strict dependency isolation.

---

## 3. Auth.js ↔ NestJS Integration

Auth.js is Next.js-centric; the API is a separate NestJS service. They bridge via **JWT**:

```
1. User logs in on Next.js  → Auth.js Credentials provider
2. Next.js verifies email+password (against the user record / via API)
3. Auth.js issues a signed JWT (HS256, shared secret) containing { sub, role }
4. Next.js stores it in the session; attaches it as `Authorization: Bearer <jwt>`
   on every call to the NestJS API
5. NestJS validates the JWT (passport-jwt strategy, same shared secret)
   → JwtAuthGuard authenticates, RolesGuard authorizes by `role` claim
```

**Shared secret:** `AUTH_SECRET` (Next) === `JWT_SECRET` (Nest) — same value, both services sign/verify with it. The JWT `role` claim is the single source of truth for RBAC on the API side.

---

## 4. Validation Strategy

- **Shared contracts:** enums and DTO shapes live in `packages/types` (Zod schemas where useful).
- **API boundary:** NestJS DTOs use `class-validator` decorators; a global `ValidationPipe` rejects bad input.
- **Web forms:** Zod + React Hook Form (or shadcn form) validate before submit.

---

## 5. Tooling & Configuration

| Concern | Setup |
|---------|-------|
| TypeScript | `tsconfig.base.json` at root; each package/app extends it. Shared presets in `packages/config`. |
| ESLint | Shared flat config in `packages/config`; per-app overrides (Next plugin, Nest). |
| Prettier | Single root config. |
| Turbo pipeline | `turbo.json` defines `build`, `dev`, `lint`, `typecheck`; `build` depends on upstream `^build`; `db` package builds before apps. |
| Env | `.env.example` at root documents all vars; each app reads its own `.env`. Never commit real `.env`. |

---

## 6. Environment Variables

| Var | Used by | Purpose |
|-----|---------|---------|
| `DATABASE_URL` | db, api | Postgres connection string |
| `JWT_SECRET` | api | Verify incoming JWTs |
| `AUTH_SECRET` | web | Auth.js session/JWT signing (same value as `JWT_SECRET`) |
| `NEXTAUTH_URL` | web | Auth.js base URL (e.g. `http://localhost:3000`) |
| `API_URL` / `NEXT_PUBLIC_API_URL` | web | Base URL of the NestJS API (e.g. `http://localhost:3001`) |
| `PORT` | api | API port (default 3001) |

---

## 7. Ports (local dev)

| Service | Port |
|---------|------|
| Next.js web | 3000 |
| NestJS API | 3001 |
| PostgreSQL | 5432 |
