# ERP Portal — Architecture

> **Version:** 1.0 · **Date:** 2026-05-29

---

## 1. Monorepo Layout

```
ERP-Portal/
├── apps/
│   ├── web/                 # Next.js 15 (App Router) — UI + Auth.js
│   └── api/                 # NestJS — REST API, RBAC, business logic
├── packages/
│   ├── db/                  # Prisma schema, client, migrations, seed
│   ├── types/               # Shared enums + DTO/Zod contracts
│   └── config/              # Shared eslint / tsconfig / prettier presets
├── docs/                    # These specs
├── turbo.json               # Task pipeline
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── package.json             # Root scripts
└── .env.example
```

**Dependency direction:** `apps/web` and `apps/api` depend on `packages/*`. Packages never depend on apps. `packages/db` and `packages/types` are the shared core.

---

## 2. Runtime Topology

```
                 ┌──────────────────────────────────────────────┐
   Browser  ───▶ │  apps/web  (Next.js :3000)                    │
                 │  • RSC pages + role-gated layouts             │
                 │  • Auth.js (login, session, JWT issue)        │
                 │  • middleware route protection                │
                 └───────────────┬──────────────────────────────┘
                                 │  fetch + Authorization: Bearer <JWT>
                                 ▼
                 ┌──────────────────────────────────────────────┐
                 │  apps/api  (NestJS :3001)                     │
                 │  • JwtAuthGuard + RolesGuard                  │
                 │  • modules: auth, clients, orders, dashboard  │
                 │  • services → Prisma                          │
                 └───────────────┬──────────────────────────────┘
                                 │  Prisma Client (packages/db)
                                 ▼
                 ┌──────────────────────────────────────────────┐
                 │  PostgreSQL :5432                             │
                 └──────────────────────────────────────────────┘
```

---

## 3. Request Flow (example: Admin posts a daily update)

```
1. Admin submits form in Next.js (/admin/orders/[id]/update)
2. Next.js server action / route handler reads the Auth.js session → JWT
3. POST {API_URL}/orders/:id/updates  with Authorization: Bearer <JWT>
4. NestJS: JwtAuthGuard verifies token → RolesGuard checks role === ADMIN
5. OrdersController → OrdersService.addDailyUpdate()
6. Prisma writes DailyUpdate row, updates Order.currentStage/status in a tx
7. 201 response → Next.js revalidates the order page
```

Read flows (Supervisor/Partner) are identical minus the role restriction and the write.

---

## 4. Auth & RBAC

### Login & token
- Auth.js **Credentials provider** in `apps/web` authenticates email + password.
- On success, Auth.js mints a JWT (`{ sub: userId, role }`) signed with `AUTH_SECRET`.
- The web app forwards this JWT to the API on every request.

### Enforcement (two layers)
1. **Web (UX gate):** Next.js `middleware.ts` redirects unauthenticated users to `/login` and blocks cross-role routes (`/admin/*` for non-admins, etc.). This is convenience, not security.
2. **API (authority gate):** NestJS `JwtAuthGuard` (passport-jwt, `JWT_SECRET`) authenticates; `RolesGuard` + `@Roles(Role.ADMIN)` authorizes. **All real authorization lives here.**

```ts
// apps/api — usage
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('orders')
create(@Body() dto: CreateOrderDto) { ... }
```

---

## 5. Data Model (MVP)

```
User ────────────────┐
  id                  │ (updatedBy)
  name                │
  email (unique)      ▼
  passwordHash      DailyUpdate
  role: Role          id
                      orderId ───────┐
Client                date           │
  id                  stage: Stage   │
  name                qtyCompleted   │
  contact             qtyPending     │
  │                   remarks        │
  │ (1..*)            updatedById    │
  ▼                                  │
Order ◀──────────────────────────────┘ (1..*)
  id
  orderCode (unique)   priority: Priority
  clientId             status: OrderStatus
  name                 currentStage: Stage
  quantity             createdAt / updatedAt
  deadline
  specifications (size, gsm, printing, handle, lamination)
```

### Enums
```ts
enum Role           { ADMIN, SUPERVISOR, PARTNER }
enum Priority       { HIGH, MEDIUM, LOW }
enum OrderStatus    { ACTIVE, DELAYED, DELIVERED }
enum ProductionStage {
  PAPER_PROCUREMENT, PRINTING, LAMINATION, PUNCHING,
  IN_HOUSE_MANUFACTURING, HANDLE_PASTING, PACKING, DISPATCH, DELIVERED
}
```

**Specifications** are modeled as structured columns (size, gsm, printingType, handleType, lamination) on `Order` for MVP — simple and queryable. Can move to a JSON column or child table if specs grow.

---

## 6. API Surface (MVP)

| Method | Route | Role | Purpose |
|--------|-------|------|---------|
| POST | `/auth/login` | public | (if API-side login used) returns JWT |
| GET | `/clients` | all | list clients |
| POST | `/clients` | Admin | create client |
| PATCH | `/clients/:id` | Admin | edit client |
| GET | `/orders` | all | list orders (filters: status, priority) |
| GET | `/orders/:id` | all | order detail + daily updates |
| POST | `/orders` | Admin | create order |
| PATCH | `/orders/:id` | Admin | edit order |
| DELETE | `/orders/:id` | Admin | delete order |
| POST | `/orders/:id/updates` | Admin | add daily production update |
| POST | `/orders/:id/deliver` | Admin | mark delivered |
| POST | `/orders/:id/verify` | Supervisor | verify reported work |
| GET | `/dashboard` | all | summary metrics (completion %, delayed, stage distribution) |

Conventions: REST resources, JSON, `class-validator` DTOs, global `ValidationPipe`, consistent error shape (`{ statusCode, message, error }`).

---

## 7. NestJS Module Map

```
AppModule
├── PrismaModule       (global) — PrismaService wrapping packages/db client
├── AuthModule         — JwtStrategy, JwtAuthGuard, RolesGuard, @Roles()
├── ClientsModule      — ClientsController / ClientsService
├── OrdersModule       — OrdersController / OrdersService (orders + daily updates + deliver/verify)
└── DashboardModule    — DashboardController / DashboardService (aggregations)
```

---

## 8. Web App Structure (Next.js App Router)

```
apps/web/app/
├── (auth)/login/              # public login (Auth.js)
├── (admin)/admin/             # ADMIN — clients, orders, daily updates
├── (supervisor)/supervisor/   # SUPERVISOR — read + verify
├── (partner)/partner/         # PARTNER — read/monitor
├── api/auth/[...nextauth]/    # Auth.js route handler
└── middleware.ts              # session + role route gating
lib/
├── auth.ts                    # Auth.js config (Credentials provider)
└── api-client.ts              # fetch wrapper attaching the JWT
```

---

## 9. Deployment Topology

| Service | Local | Production (typical) |
|---------|-------|----------------------|
| web | `pnpm --filter web dev` :3000 | Vercel / Node host |
| api | `pnpm --filter api dev` :3001 | Container / Node host (Railway, Render, Fly) |
| db | local Postgres :5432 | managed Postgres (Neon, RDS, Supabase) |

Env boundaries: `AUTH_SECRET`/`NEXTAUTH_URL`/`NEXT_PUBLIC_API_URL` on web; `DATABASE_URL`/`JWT_SECRET`/`PORT` on api. `AUTH_SECRET` and `JWT_SECRET` hold the **same** value.

---

## 10. Cross-Cutting Concerns

- **Validation:** shared enums/contracts in `packages/types`; DTO validation at the API boundary.
- **Error handling:** NestJS exception filters → consistent JSON errors; web surfaces friendly messages.
- **Transactions:** order-mutating writes (daily update + status/stage change) run in a Prisma `$transaction`.
- **Migrations:** Prisma migrations versioned in `packages/db/prisma/migrations`.
- **Testing (target):** Nest service/controller unit tests; web component + e2e (Playwright) for the happy-path order lifecycle.
