import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TabGuard } from '../auth/guards/tab.guard';

// Global so TabGuard + PermissionsService resolve in any feature module's
// @UseGuards/controller context without re-importing.
@Global()
@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, TabGuard],
  exports: [PermissionsService, TabGuard],
})
export class PermissionsModule {}
