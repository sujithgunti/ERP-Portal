import { PartialType } from '@nestjs/mapped-types';
import { CreateExpensePeriodDto } from './create-expense-period.dto';

export class UpdateExpensePeriodDto extends PartialType(CreateExpensePeriodDto) {}
