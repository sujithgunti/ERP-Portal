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
