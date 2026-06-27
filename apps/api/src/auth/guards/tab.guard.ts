import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '@erp/types';
import { REQUIRE_TAB_KEY } from '../decorators/require-tab.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

/**
 * Enforces @RequireTab(bit): the authenticated user's role must have that tab
 * bit set. ADMIN bypasses (handled in PermissionsService.can). Real backend gate
 * behind the frontend sidebar filtering.
 */
@Injectable()
export class TabGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bit = this.reflector.getAllAndOverride<number>(REQUIRE_TAB_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!bit) return true; // no tab requirement on this route

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user || !(await this.permissions.can(user, bit))) {
      throw new ForbiddenException('Tab not permitted for this user');
    }
    return true;
  }
}
