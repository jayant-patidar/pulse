// ============================================================
// RBAC Guard — Centralized in common/
// ============================================================
// Checks the current user's permissions against those required
// by the @RequirePermissions() decorator.
// Usage: @UseGuards(JwtAuthGuard, RbacGuard)
// ============================================================
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload } from '@pulse/types';
import { RbacService } from '../../root/rbac/rbac.service';
import { PERMISSIONS_KEY } from '../decorators';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const hasPermission = await this.rbacService.hasPermissions(
      user.sub,
      user.org,
      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
