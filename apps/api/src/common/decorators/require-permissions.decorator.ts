// ============================================================
// @RequirePermissions Decorator
// ============================================================
// Marks an endpoint as requiring specific RBAC permission strings.
// Works in conjunction with the RbacGuard.
// Usage: @RequirePermissions('project:create')
// ============================================================
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
