# ERP Portal — Product Specification

> **Version:** 1.0 · **Date:** 2026-05-29 · **Status:** Approved for MVP build
> **Domain:** Eco-bag manufacturing factory — client orders, production tracking, role-based monitoring.

---

## 1. Purpose

The ERP Portal is the single system of record for the factory's order-to-delivery pipeline. It replaces the current manual diary/WhatsApp workflow with structured, role-aware tracking.

It exists to answer four questions at any moment:

1. **What orders do we have, and when are they due?**
2. **What production stage is each order in, and how much is done vs pending?**
3. **Which orders are delayed or at risk?**
4. **How efficiently are workers and machines producing?** *(Phase 2)*

---

## 2. Target Users & Roles

The factory operates with three distinct actors. Every screen, permission, and report is scoped to one of these roles.

| Role | Who | Primary job in the system |
|------|-----|----------------------------|
| **Admin** | Office/data-entry operator | Owns all data entry. Creates clients & orders, uploads daily production status, manages deadlines, marks delivery. |
| **Supervisor** | Floor/production planner | Read + verify. Views deadlines, specs, and order status to plan manpower and machinery. Verifies completed work. **Cannot edit client data or delete orders.** |
| **Partner** | Business owner(s), often remote | Read-only monitoring. Views all orders, production updates, delay analysis, completion %, and (Phase 2) worker/machine efficiency charts. |

**Note on the source notes:** the early handwritten/exported docs are reconciled here. The canonical model is **Admin = sole data entry**, **Supervisor = view + verify (planning)**, **Partner = full read/monitoring**. Where notes said "Supervisor uploads daily status," that responsibility is consolidated under **Admin** for v1 to keep one clear data-entry owner. Supervisor verification remains.

---

## 3. End-to-End Flow

```
Client gives order
        ↓
Partner relays order details (name, qty, deadline, specs)
        ↓
Admin creates the order in the ERP  ──────────────┐
        ↓                                          │
Supervisor views deadline & specs → plans          │  (read access)
production (manpower + machinery)                   │
        ↓                                          │
Admin enters DAILY production updates               │
(current stage, qty completed, qty pending, remarks)│
        ↓                                          │
Partner monitors progress remotely  ◀──────────────┘
        ↓
System tracks stage durations & flags delays
        ↓
Admin marks order DELIVERED
        ↓
System generates the final order report
(timeline, delay analysis, completion %)
```

---

## 4. Production Stages

Every order moves through ten ordered stages. The order's `currentStage` always points at exactly one of these. Daily updates record progress within a stage.

| # | Stage | Meaning |
|---|-------|---------|
| 1 | **Paper Procurement** | Raw paper sourced/purchased for the order. |
| 2 | **Printing** | Client artwork printed on the stock. |
| 3 | **Designing** | Design step applied after printing. |
| 4 | **Lamination** | Lamination applied (if spec requires). |
| 5 | **Punching** | Bag shapes/handles punched. |
| 6 | **In-House Manufacturing** | Core bag forming (side/bottom pasting, folding). |
| 7 | **Handle Pasting** | Handles attached. |
| 8 | **Packing** | Finished bags packed for dispatch. |
| 9 | **Dispatch** | Order shipped to client. |
| 10 | **Delivered** | Confirmed received by client. Order closes. |

Stages are **sequential** but a daily update may report partial completion (e.g. "Printing: 10,000 done, 40,000 pending").

---

## 5. Core Entities (MVP)

| Entity | Key fields |
|--------|-----------|
| **User** | name, email, passwordHash, role (`ADMIN` / `SUPERVISOR` / `PARTNER`) |
| **Client** | name, gstNumber (optional), phone (optional) |
| **Order** | orderCode (`ORD-001`), client, name, quantity, deadline, specifications (size, GSM, printing type, handle type, lamination), notes, priority (`HIGH` / `MEDIUM` / `LOW`), status (`ACTIVE` / `DELAYED` / `DELIVERED`), currentStage |
| **DailyUpdate** | order, date, stage, quantityCompleted, quantityPending, remarks, updatedBy |
| **OrderCost** | order (1:1), material lines (name + cost/bag), overheadPerBag (manual), sellingPricePerBag → computes cost/bag, total, margin |
| **MaterialLine** | orderCost, name, costPerBag |
| **DailyExpense** | date, direction (`INCOMING` / `OUTGOING`), amount, category, note → daily in/out/net cash book |
| **Worker** | name, phone, role, active |
| **Attendance** | worker, date, status (`PRESENT` / `ABSENT` / `HALF_DAY`) — one per worker/day |
| **Machine** | name, type, active |
| **MachineProduction** | machine, date, bagsProduced — one per machine/day (Work Efficiency) |

**Deferred entities (documented in feature map):** `DelayRecord`, `Notification`, per-worker wages → auto labour cost.

---

## 6. Permission Matrix (MVP)

| Action | Admin | Supervisor | Partner |
|--------|:-----:|:----------:|:-------:|
| Create / edit client | ✅ | ❌ | ❌ |
| Create / edit order | ✅ | ❌ | ❌ |
| Upload daily production update | ✅ | ❌ | ❌ |
| Mark order delivered | ✅ | ❌ | ❌ |
| Delete order | ✅ | ❌ | ❌ |
| View orders / deadlines / specs | ✅ | ✅ | ✅ |
| View production status | ✅ | ✅ | ✅ |
| Verify completed work | ✅ | ✅ | ❌ |
| View dashboard | ✅ | ✅ | ✅ |
| View reports / delay analysis | ✅ | partial | ✅ |
| View worker/machine efficiency *(Phase 2)* | ✅ | ❌ | ✅ |

---

## 7. Screens by Role

### 7.1 Admin Console
- **Clients** — list, create, edit.
- **Orders** — list with filters (status, priority, deadline); create/edit order form (client, qty, deadline, specs, priority).
- **Daily Update** — pick an order → record stage, qty completed, qty pending, remarks for today.
- **Order Detail** — full timeline of daily updates; "Mark Delivered" action.
- **Dashboard** — same as below, with edit affordances.

### 7.2 Supervisor Monitor
- **Orders (read)** — all orders, sortable by deadline/priority; highlights urgent + delayed.
- **Order Detail (read)** — specs, current stage, daily history.
- **Verify** — mark a reported stage/work as verified.
- **Dashboard** — production-planning view (what's urgent, what stage, what's delayed).

### 7.3 Partner Dashboard
- **Overview** — today's summary + completion metrics.
- **Orders (read)** — every order, progress %, delay status.
- **Order Detail (read)** — timeline, delay analysis, completion time.
- **Reports** — delay analysis, order summaries. *(Phase 2: efficiency charts.)*

---

## 8. Dashboard Contents

Visible to all roles (Admin/Supervisor get planning emphasis, Partner gets monitoring emphasis):

- **Today's summary** — active orders, orders due soon, orders delivered today.
- **Order completion %** — per order and aggregate.
- **Delayed orders** — orders past or at risk of deadline, with current stage.
- **Stage distribution** — how many orders sit in each production stage.
- *(Phase 2)* total bags produced today, machine utilization, worker productivity.

---

## 9. Delay Tracking (Phase 2 detail, modeled now)

The system records time spent in each stage to compute:
- Expected vs actual duration per stage.
- Delay (in days) per stage and per order.
- Delay cause (free-text/remark — e.g. "printing machine breakdown", "paper delay").

Final order report combines: order created date, production start, per-stage completion dates, delivery date, total expected vs actual duration, and delay causes.

---

## 10. Scope: MVP vs Future

### ✅ Built (Phase 1 + early Phase 2)
- RBAC auth (Admin / Supervisor / Partner).
- Client management (Admin) — name, GST number, phone.
- Order management with specs, notes, priority, deadline (Admin).
- 10-stage production tracking via daily updates (Admin).
- Read/monitor views (Supervisor, Partner).
- Work verification (Supervisor).
- Dashboard: today's summary, delayed orders, **order-wise stage distribution** (orders listed under each stage).
- **Costing** — per-order material lines + manual overhead/bag + selling price → cost/bag, total cost, margin.
- **Daily expenses** — incoming/outgoing cash book with per-day in/out/net totals.
- **Attendance** — workers + daily Present/Absent/Half-day marking + monthly summary.
- **Work Efficiency** — machines + daily bags-produced count per machine + monthly totals.

### 🔜 Phase 2
- Lady-worker manual production entry (side/bottom/handle pasting counts, auto-total).
- Machinery daily count module (punching, side-pasting, bottom-pasting machines).
- Worker & machine efficiency charts.
- Delay analysis reports + final order performance report.

### 🧠 Phase 3 (Future / AI)
- Deadline & delay alerts (3-day / 1-day before).
- Production-target-not-met alerts.
- Automated voice calls → WhatsApp message routing.
- AI: paper requirement prediction, labor-shortage prediction, machine-downtime alerts, deadline-risk alerts, production scheduling suggestions, raw-material reorder alerts, cost-per-bag, profit-per-order.

---

## 11. Success Criteria (MVP)

- An Admin can create a client, an order with specs, and post daily updates that move it through all 9 stages to delivered.
- A Supervisor and a Partner can log in and see live order status without being able to edit data.
- The dashboard accurately shows completion % and flags any order past its deadline as delayed.
- All access is enforced server-side by role (no client-only gating).
