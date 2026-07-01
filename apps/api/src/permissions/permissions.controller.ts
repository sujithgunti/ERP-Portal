import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthUser } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PermissionsService } from './permissions.service';

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) {}

  /** Current user's effective tab mask — drives the sidebar / shell guard. */
  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<{ tabs: number }> {
    return { tabs: await this.permissions.tabsFor(user) };
  }
}
