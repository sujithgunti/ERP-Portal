# ERP Portal

Order & production tracking ERP for an eco-bag manufacturing factory.
Role-based (Admin / Supervisor / Partner) tracking of client orders through a 9-stage production pipeline.

## Stack

Turborepo + pnpm · Next.js 15 (web) · NestJS (api) · Prisma + PostgreSQL · Auth.js (JWT, RBAC).

## Structure

```
apps/web      Next.js 15 App Router + Auth.js + Tailwind
apps/api      NestJS REST API (auth, clients, orders, dashboard)
packages/db   Prisma schema, client, seed
packages/types shared enums + DTO contracts
packages/config shared tsconfig presets
docs/         product spec, tech stack, architecture, dev guide, feature map
```

## Quick start

```bash
pnpm install
createdb erp_portal
cp .env.example .env
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev          # web :3000, api :3001
```

Seed logins (password = `<role>123`): `admin@erp.local`, `supervisor@erp.local`, `partner@erp.local`.

## Docs

- [Product Spec](docs/01-product-spec.md)
- [Tech Stack](docs/02-tech-stack.md)
- [Architecture](docs/03-architecture.md)
- [Developer Guide](docs/04-developer-guide.md)
- [Feature Map](docs/05-feature-map.md)
