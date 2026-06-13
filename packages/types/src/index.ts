/**
 * Shared domain contracts for the ERP Portal.
 * Mirrors the Prisma enums in @erp/db and the DTO shapes crossing web <-> api.
 * Keep this framework-agnostic (no Next/Nest imports).
 */

// ---- Enums (string unions kept in sync with packages/db/prisma/schema.prisma) ----

export const Role = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  PARTNER: 'PARTNER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Priority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const OrderStatus = {
  ACTIVE: 'ACTIVE',
  DELAYED: 'DELAYED',
  DELIVERED: 'DELIVERED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ExpenseDirection = {
  INCOMING: 'INCOMING',
  OUTGOING: 'OUTGOING',
} as const;
export type ExpenseDirection = (typeof ExpenseDirection)[keyof typeof ExpenseDirection];

export const ProductionStage = {
  PAPER_PROCUREMENT: 'PAPER_PROCUREMENT',
  PRINTING: 'PRINTING',
  DESIGNING: 'DESIGNING',
  LAMINATION: 'LAMINATION',
  PUNCHING: 'PUNCHING',
  IN_HOUSE_MANUFACTURING: 'IN_HOUSE_MANUFACTURING',
  HANDLE_PASTING: 'HANDLE_PASTING',
  PACKING: 'PACKING',
  DISPATCH: 'DISPATCH',
  DELIVERED: 'DELIVERED',
} as const;
export type ProductionStage = (typeof ProductionStage)[keyof typeof ProductionStage];

/** Ordered list of production stages (pipeline order). */
export const PRODUCTION_STAGE_ORDER: ProductionStage[] = [
  ProductionStage.PAPER_PROCUREMENT,
  ProductionStage.PRINTING,
  ProductionStage.DESIGNING,
  ProductionStage.LAMINATION,
  ProductionStage.PUNCHING,
  ProductionStage.IN_HOUSE_MANUFACTURING,
  ProductionStage.HANDLE_PASTING,
  ProductionStage.PACKING,
  ProductionStage.DISPATCH,
  ProductionStage.DELIVERED,
];

// ---- DTO contracts (request/response shapes shared across the wire) ----

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// ---- User / role management (Admin creates login users) ----

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
}

export interface UpdateUserDto {
  name?: string;
  role?: Role;
}

/** Returned once on create / password reset — the plaintext password to share. */
export interface CredentialResult {
  user: UserRow;
  password: string;
}

// ---- Reports (read-only, date-ranged tables) ----

export interface OrderReportRow {
  orderCode: string;
  name: string;
  client: string;
  quantity: number;
  priority: Priority;
  status: OrderStatus;
  currentStage: ProductionStage;
  deadline: string;
  createdAt: string;
  deliveredAt: string | null;
  materialPerBag: number;
  overheadPerBag: number;
  costPerBag: number;
  totalCost: number;
  sellingPricePerBag: number | null;
  totalMargin: number | null;
}

export interface ExpenseReportRow {
  date: string;
  direction: ExpenseDirection;
  category: string | null;
  amount: number;
  note: string | null;
}

export interface WorkEfficiencyReportRow {
  date: string;
  machine: string;
  type: string | null;
  bagsProduced: number;
}

/** Generic report envelope: rows + a summary line. */
export interface ReportResult<Row> {
  from: string;
  to: string;
  count: number;
  rows: Row[];
  totals: Record<string, number>;
}

export interface OrderSpecifications {
  size?: string;
  gsm?: number;
  printingType?: string;
  handleType?: string;
  lamination?: boolean;
}

export interface CreateClientDto {
  name: string;
  gstNumber?: string;
  phone?: string;
}

export interface CreateOrderDto {
  clientId: string;
  name: string;
  quantity: number;
  deadline: string; // ISO date
  priority: Priority;
  size?: string;
  gsm?: number;
  printingType?: string;
  handleType?: string;
  lamination?: boolean;
  notes?: string;
}

export interface CreateDailyUpdateDto {
  stage: ProductionStage;
  quantityCompleted: number;
  quantityPending: number;
  remarks?: string;
  date?: string; // ISO date; defaults to today
}

export interface DashboardSummary {
  activeOrders: number;
  deliveredToday: number;
  dueSoon: number;
  delayedOrders: number;
  stageDistribution: Record<ProductionStage, number>;
}

// ---- Daily expenses: incoming / outgoing cash book ----

export interface DailyExpenseRow {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  direction: ExpenseDirection;
  amount: number;
  category: string | null;
  note: string | null;
  createdAt: string;
}

export interface CreateDailyExpenseDto {
  date: string; // ISO date (YYYY-MM-DD)
  direction: ExpenseDirection;
  amount: number;
  category?: string;
  note?: string;
}

export interface UpdateDailyExpenseDto {
  date?: string;
  direction?: ExpenseDirection;
  amount?: number;
  category?: string;
  note?: string;
}

/** A single day's cash entries + totals (incoming, outgoing, net). */
export interface DailyExpenseDay {
  date: string;
  incoming: number;
  outgoing: number;
  net: number;
  entries: DailyExpenseRow[];
}

// ---- Costing: per-order cost breakdown (overhead entered manually) ----

export interface MaterialLineDto {
  name: string;
  costPerBag: number;
}

export interface MaterialLineRow extends MaterialLineDto {
  id: string;
}

export interface SetOrderCostDto {
  overheadPerBag?: number | null;
  sellingPricePerBag?: number | null;
  note?: string;
  materialLines: MaterialLineDto[];
}

// ---- Workforce: workers + daily attendance ----

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface WorkerRow {
  id: string;
  name: string;
  phone: string | null;
  role: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateWorkerDto {
  name: string;
  phone?: string;
  role?: string;
  active?: boolean;
}

export interface UpdateWorkerDto {
  name?: string;
  phone?: string;
  role?: string;
  active?: boolean;
}

/** One worker's mark for a given day (status null = not marked yet). */
export interface AttendanceRosterRow {
  workerId: string;
  name: string;
  role: string | null;
  attendanceId: string | null;
  status: AttendanceStatus | null;
  checkIn: string | null; // "HH:MM"
  checkOut: string | null; // "HH:MM"
  note: string | null;
}

export interface MarkAttendanceDto {
  workerId: string;
  date: string; // ISO date (YYYY-MM-DD)
  status: AttendanceStatus;
  checkIn?: string | null; // "HH:MM"
  checkOut?: string | null; // "HH:MM"
  note?: string;
}

/** Per-worker monthly tally. */
export interface AttendanceSummaryRow {
  workerId: string;
  name: string;
  role: string | null;
  present: number;
  absent: number;
  halfDay: number;
}

export interface OrderCostBreakdown {
  orderId: string;
  quantity: number;
  materialLines: MaterialLineRow[];
  materialPerBag: number;
  overheadPerBag: number;
  costPerBag: number;
  totalCost: number;
  sellingPricePerBag: number | null;
  marginPerBag: number | null;
  totalMargin: number | null;
  marginPct: number | null;
  note: string | null;
}

// ---- Work efficiency: machines + daily bag-production count ----

export interface MachineRow {
  id: string;
  name: string;
  type: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateMachineDto {
  name: string;
  type?: string;
  active?: boolean;
}

export interface UpdateMachineDto {
  name?: string;
  type?: string;
  active?: boolean;
}

/** One machine's output for a given day (bags null = not entered yet). */
export interface MachineProductionRosterRow {
  machineId: string;
  name: string;
  type: string | null;
  productionId: string | null;
  bagsProduced: number | null;
  note: string | null;
}

export interface SetMachineProductionDto {
  machineId: string;
  date: string; // ISO date (YYYY-MM-DD)
  bagsProduced: number;
  note?: string;
}

/** Per-machine tally over a month. */
export interface MachineSummaryRow {
  machineId: string;
  name: string;
  type: string | null;
  totalBags: number;
  daysRun: number;
  avgPerDay: number;
}
