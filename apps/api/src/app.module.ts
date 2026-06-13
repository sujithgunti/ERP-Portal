import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { OrdersModule } from './orders/orders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CostingModule } from './costing/costing.module';
import { WorkersModule } from './workers/workers.module';
import { MachinesModule } from './machines/machines.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    OrdersModule,
    DashboardModule,
    ExpensesModule,
    CostingModule,
    WorkersModule,
    MachinesModule,
    UsersModule,
    ReportsModule,
  ],
})
export class AppModule {}
