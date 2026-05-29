# ERP Portal — Feature Map

> **Version:** 1.0 · **Date:** 2026-05-29
> **Legend:** Phase 1 = MVP (this build) · Phase 2 = production + reports · Phase 3 = notifications + AI
> **Status:** ⬜ not started · 🔨 in progress · ✅ done

---

## 1. Roadmap Phases

| Phase | Theme | Outcome |
|-------|-------|---------|
| **Phase 1 — MVP** | Orders + stages + roles | Admin runs orders through 9 stages; Supervisor/Partner monitor; dashboard live. |
| **Phase 2** | Production & reports | Worker/machine entry, efficiency charts, delay analysis, final reports. |
| **Phase 3** | Notifications & AI | Alerts, voice→WhatsApp automation, predictive features. |

---

## 2. Feature Inventory

### A. Authentication & Access
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Login (Auth.js credentials) | all | 1 | ⬜ |
| JWT issue + API validation | all | 1 | ⬜ |
| RBAC (Admin/Supervisor/Partner) guards | all | 1 | ⬜ |
| Route gating (web middleware) | all | 1 | ⬜ |
| User management (create/disable users) | Admin | 2 | ⬜ |
| Password reset | all | 2 | ⬜ |

### B. Client Management
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Create client | Admin | 1 | ⬜ |
| Edit client | Admin | 1 | ⬜ |
| List / view clients | all | 1 | ⬜ |
| Client contact / communication log | Admin | 3 | ⬜ |

### C. Order Management
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Create order (qty, deadline, specs, priority) | Admin | 1 | ⬜ |
| Edit / delete order | Admin | 1 | ⬜ |
| Order specifications (size, gsm, printing, handle, lamination) | Admin | 1 | ⬜ |
| Priority (High/Medium/Low) | Admin | 1 | ⬜ |
| List / filter orders | all | 1 | ⬜ |
| Order detail view | all | 1 | ⬜ |
| Mark delivered | Admin | 1 | ⬜ |

### D. Production Tracking (9-stage)
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Daily production update (stage, qty done, pending, remarks) | Admin | 1 | ⬜ |
| Current-stage tracking | Admin | 1 | ⬜ |
| Daily update timeline per order | all | 1 | ⬜ |
| Verify completed work | Supervisor | 1 | ⬜ |
| Stage progress % | all | 1 | ⬜ |

### E. Worker & Machine Production *(Phase 2)*
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Lady-worker manual entry (side/bottom/handle pasting, folding) | Admin | 2 | ⬜ |
| Auto-calculate total bags per worker | Admin | 2 | ⬜ |
| Default `0` for no-work tasks | Admin | 2 | ⬜ |
| Machinery daily count (punching, side/bottom pasting) | Admin | 2 | ⬜ |
| Start/end count → total production | Admin | 2 | ⬜ |
| Worker efficiency charts | Partner | 2 | ⬜ |
| Machine efficiency / utilization charts | Partner | 2 | ⬜ |

### F. Dashboard
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Today's summary (active/due/delivered) | all | 1 | ⬜ |
| Order completion % | all | 1 | ⬜ |
| Delayed orders list | all | 1 | ⬜ |
| Stage distribution | all | 1 | ⬜ |
| Total bags produced today | all | 2 | ⬜ |
| Machine utilization / worker productivity widgets | all | 2 | ⬜ |

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
| Cost-per-bag calculation | Partner | 3 | ⬜ |
| Profit-per-order tracking | Partner | 3 | ⬜ |

### J. Inventory *(Phase 3, future)*
| Feature | Roles | Phase | Status |
|---------|-------|:-----:|:------:|
| Paper / handle / gum stock tracking | Admin | 3 | ⬜ |

---

## 3. MVP Cut Line

Everything in **Phase 1** ships in v1. Phase 2 and Phase 3 are documented here so the data model and architecture leave room for them, but they are **not built in this iteration**.

The MVP is "done" when an order can travel Admin-created → through all 9 stages → delivered, with Supervisor/Partner monitoring live and the dashboard reflecting completion % and delays. See [01-product-spec.md §11](01-product-spec.md) for success criteria.
