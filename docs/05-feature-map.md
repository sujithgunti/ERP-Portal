# ERP Portal — Feature Map

> **Version:** 1.0 · **Date:** 2026-05-29
> **Legend:** Phase 1 = MVP (this build) · Phase 2 = production + reports · Phase 3 = notifications + AI
> **Status:** ⬜ not started · 🔨 in progress · ✅ done

---

## 1. Roadmap Phases

| Phase | Theme | Outcome |
|-------|-------|---------|
| **Phase 1 — MVP** | Orders + stages + roles | Admin runs orders through 10 stages; Supervisor/Partner monitor; dashboard live. |
| **Phase 2** | Production & reports | Worker/machine entry, efficiency charts, delay analysis, final reports. |
| **Phase 3** | Notifications & AI | Alerts, voice→WhatsApp automation, predictive features. |

---

## 2. Feature Inventory

### A. Authentication & Access
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Login (JWT credentials, localStorage) | all | 1 | ✅ |
| JWT issue + API validation | all | 1 | ✅ |
| RBAC (Admin/Supervisor/Partner) guards | all | 1 | ✅ |
| Route gating (client guard) | all | 1 | ✅ |
| User management (create/disable users) | Admin | 2 | ⬜ |
| Password reset | all | 2 | ⬜ |

### B. Client Management
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Create client (name, GST number, phone) | Admin | 1 | ✅ |
| Edit client | Admin | 1 | ✅ |
| List / view clients | all | 1 | ✅ |

### C. Order Management
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Create order (qty, deadline, specs, notes, priority) | Admin | 1 | ✅ |
| Edit / delete order | Admin | 1 | ✅ |
| Order specifications (size, gsm, printing, handle, lamination) | Admin | 1 | ✅ |
| Additional notes / message | Admin | 1 | ✅ |
| Priority (High/Medium/Low) | Admin | 1 | ✅ |
| List / filter orders | all | 1 | ✅ |
| Order detail view | all | 1 | ✅ |
| Mark delivered | Admin | 1 | ✅ |

### D. Production Tracking (10-stage)
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Daily production update (stage, qty done, pending, remarks) | Admin | 1 | ✅ |
| Stages incl. **Designing** (after Printing) | — | 1 | ✅ |
| Current-stage tracking | Admin | 1 | ✅ |
| Daily update timeline per order | all | 1 | ✅ |
| Verify completed work | Supervisor | 1 | ✅ |
| Stage progress % | all | 1 | ✅ |

### E. Worker Attendance & Machine Efficiency
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Worker management (add/edit/deactivate) | Admin | 2 | ✅ |
| Daily attendance (Present/Absent/Half-day) | Admin | 2 | ✅ |
| Monthly attendance summary | all | 2 | ✅ |
| Machine management (add/edit/deactivate) | Admin | 2 | ✅ |
| Daily bags-produced count per machine (Work Efficiency) | Admin | 2 | ✅ |
| Monthly machine totals / avg per day | all | 2 | ✅ |
| Per-worker wages → auto labour cost | Admin | 2 | ⬜ |
| Efficiency charts | Partner | 2 | ⬜ |

### F. Dashboard
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Today's summary (active/due/delivered/delayed) | all | 1 | ✅ |
| Delayed orders list | all | 1 | ✅ |
| Order-wise stage distribution (orders under each stage) | all | 1 | ✅ |
| Total bags produced today | all | 2 | ⬜ |

### K. Costing (per-order cost-per-bag)
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Material lines per order (name + cost/bag) | Admin | 1 | ✅ |
| Manual overhead per bag | Admin | 1 | ✅ |
| Selling price → cost/bag, total cost, margin | Admin | 1 | ✅ |

### L. Daily Expenses (cash book)
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Daily incoming / outgoing entries (amount, category, note) | Admin | 1 | ✅ |
| Per-day totals: incoming, outgoing, net | all | 1 | ✅ |

### G. Delay Tracking & Reports *(Phase 2)*
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Time-in-stage tracking | system | 2 | ⬜ |
| Expected vs actual duration | all | 2 | ⬜ |
| Delay analysis (per stage, per order, cause) | Partner | 2 | ⬜ |
| Final timeline report | Partner | 2 | ⬜ |
| Efficiency report | Partner | 2 | ⬜ |
| Order summary report | Partner | 2 | ⬜ |

### H. Notifications & Alerts *(Phase 3)*
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Deadline alerts (3-day / 1-day before) | Admin/Partner | 3 | ⬜ |
| Delay alerts (stuck in a stage) | Admin/Partner | 3 | ⬜ |
| Production-target-not-met alert | Admin | 3 | ⬜ |
| Automated voice call → WhatsApp routing | system | 3 | ⬜ |

### I. AI / Predictive *(Phase 3)*
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Paper requirement prediction | Partner | 3 | ⬜ |
| Labor-shortage prediction | Partner | 3 | ⬜ |
| Machine-downtime alerts | Admin | 3 | ⬜ |
| Deadline-risk alerts | Partner | 3 | ⬜ |
| Production-scheduling suggestions | Supervisor | 3 | ⬜ |
| Raw-material reorder alerts | Admin | 3 | ⬜ |
| Cost-per-bag calculation | Admin | 1 | ✅ (manual, see §K) |
| Profit-per-order tracking | Admin | 1 | ✅ (margin, see §K) |

### J. Inventory *(Phase 3, future)*
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Paper / handle / gum stock tracking | Admin | 3 | ⬜ |

---

## 3. MVP Cut Line

Everything in **Phase 1** ships in v1. Phase 2 and Phase 3 are documented here so the data model and architecture leave room for them, but they are **not built in this iteration**.

The MVP is "done" when an order can travel Admin-created → through all 10 stages → delivered, with Supervisor/Partner monitoring live and the dashboard reflecting stage distribution and delays. Beyond MVP, costing, daily expenses, attendance, and machine work-efficiency are also built. See [01-product-spec.md §11](01-product-spec.md) for success criteria.
