import type { OrderStatus, Priority, ProductionStage } from '@erp/types';

// Re-export shared contracts for web-side imports.
export type {
  ExpenseDirection,
  DailyExpenseRow,
  CreateDailyExpenseDto,
  UpdateDailyExpenseDto,
  DailyExpenseDay,
  MaterialLineDto,
  MaterialLineRow,
  SetOrderCostDto,
  OrderCostBreakdown,
  AttendanceStatus,
  WorkerRow,
  CreateWorkerDto,
  UpdateWorkerDto,
  AttendanceRosterRow,
  MarkAttendanceDto,
  AttendanceSummaryRow,
  MachineRow,
  CreateMachineDto,
  UpdateMachineDto,
  MachineProductionRosterRow,
  SetMachineProductionDto,
  MachineSummaryRow,
} from '@erp/types';

export interface ClientRow {
  id: string;
  name: string;
  gstNumber: string | null;
  phone: string | null;
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
  notes: string | null;
  deliveredAt: string | null;
  client: { id: string; name: string; gstNumber: string | null; phone: string | null };
  dailyUpdates: DailyUpdateRow[];
}
