import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantContext {
  organizationId: string;
  userId: string;
  role: string;
  industry?: string;
}

@Injectable()
export class TenantInjectionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const user = (req as unknown as Record<string, unknown>)['user'] as
      | { sub: string; org: string; role: string }
      | undefined;

    if (user?.org) {
      (req as unknown as Record<string, unknown>)['tenantContext'] = {
        organizationId: user.org,
        userId: user.sub,
        role: user.role,
      } satisfies TenantContext;
    }

    next();
  }
}

export function extractTenantContext(req: Request): TenantContext {
  const ctx = (req as unknown as Record<string, unknown>)['tenantContext'] as TenantContext | undefined;
  if (!ctx?.organizationId) {
    throw new UnauthorizedException('No tenant context found. Authentication required.');
  }
  return ctx;
}
