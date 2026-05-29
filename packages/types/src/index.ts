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
