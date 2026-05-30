import type { OrderStatus, Priority, ProductionStage } from '@erp/types';

export interface ClientRow {
  id: string;
  name: string;
  contact: string | null;
  createdAt: string;
}

export interface OrderRow {
  id: string;
  orderCode: string;
  name: string;
  quantity: number;
  deadline: string;
  priority: Priority;
  status: OrderStatus;
  currentStage: ProductionStage;
  client: { id: string; name: string };
  createdAt: string;
}

export interface DailyUpdateRow {
  id: string;
  date: string;
  stage: ProductionStage;
  quantityCompleted: number;
  quantityPending: number;
  remarks: string | null;
  verified: boolean;
  updatedBy: { id: string; name: string };
}

export interface OrderDetail extends OrderRow {
  size: string | null;
  gsm: number | null;
  printingType: string | null;
  handleType: string | null;
  lamination: boolean;
  deliveredAt: string | null;
  client: { id: string; name: string; contact: string | null };
  dailyUpdates: DailyUpdateRow[];
}
