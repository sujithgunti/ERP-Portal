import { Module } from '@nestjs/common';
import { ExpensesModule } from '../expenses/expenses.module';
import { CostingService } from './costing.service';
import { CostingController } from './costing.controller';

@Module({
  imports: [ExpensesModule],
  controllers: [CostingController],
  providers: [CostingService],
})
export class CostingModule {}
