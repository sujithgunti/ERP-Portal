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

export const ExpenseCategory = {
  ELECTRICITY: 'ELECTRICITY',
  LABOUR: 'LABOUR',
  RENT: 'RENT',
  COOLANT: 'COOLANT',
  GUM: 'GUM',
  TRANSPORT: 'TRANSPORT',
  MACHINE_MAINTENANCE: 'MACHINE_MAINTENANCE',
  BOILER: 'BOILER',
  WATER: 'WATER',
  OTHER: 'OTHER',
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

/** Display order + labels for expense categories. */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.ELECTRICITY,
  ExpenseCategory.LABOUR,
  ExpenseCategory.RENT,
  ExpenseCategory.COOLANT,
  ExpenseCategory.GUM,
  ExpenseCategory.TRANSPORT,
  ExpenseCategory.MACHINE_MAINTENANCE,
  ExpenseCategory.BOILER,
  ExpenseCategory.WATER,
  ExpenseCategory.OTHER,
];

export const ProductionStage = {
  PAPER_PROCUREMENT: 'PAPER_PROCUREMENT',
  PRINTING: 'PRINTING',
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

export interface OrderSpecifications {
  size?: string;
  gsm?: number;
  printingType?: string;
  handleType?: string;
  lamination?: boolean;
}

export interface CreateClientDto {
  name: string;
  contact?: string;
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

// ---- Costing: monthly expense ledger + per-order cost breakdown ----

export interface ExpenseItemRow {
  id: string;
  category: ExpenseCategory;
  amount: number;
  note: string | null;
  createdAt: string;
}

export interface ExpensePeriodRow {
  id: string;
  month: number; // 1-12
  year: number;
  totalBagsProduced: number;
  note: string | null;
  totalExpense: number; // Σ items.amount
  overheadPerBag: number; // totalExpense / totalBagsProduced (0 if no bags)
  itemCount: number;
  createdAt: string;
  items?: ExpenseItemRow[]; // present on detail fetch
}

export interface CreateExpensePeriodDto {
  month: number;
  year: number;
  totalBagsProduced?: number;
  note?: string;
}

export interface UpdateExpensePeriodDto {
  month?: number;
  year?: number;
  totalBagsProduced?: number;
  note?: string;
}

export interface CreateExpenseItemDto {
  category: ExpenseCategory;
  amount: number;
  note?: string;
}

export interface UpdateExpenseItemDto {
  category?: ExpenseCategory;
  amount?: number;
  note?: string;
}

export interface MaterialLineDto {
  name: string;
  costPerBag: number;
}

export interface MaterialLineRow extends MaterialLineDto {
  id: string;
}

export interface SetOrderCostDto {
  overheadPeriodId?: string | null;
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
  note: string | null;
}

export interface MarkAttendanceDto {
  workerId: string;
  date: string; // ISO date (YYYY-MM-DD)
  status: AttendanceStatus;
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
  overheadPeriodId: string | null;
  overheadPeriod: { id: string; month: number; year: number } | null;
  overheadPerBag: number;
  costPerBag: number;
  totalCost: number;
  sellingPricePerBag: number | null;
  marginPerBag: number | null;
  totalMargin: number | null;
  marginPct: number | null;
  note: string | null;
}
