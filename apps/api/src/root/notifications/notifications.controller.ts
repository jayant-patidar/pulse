import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service'; // Service import
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const orgId = (req as any).tenantId; // From TenantInjectionMiddleware
    return this.notificationsService.getUserNotifications(userId, orgId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).sub;
    const orgId = (req as any).tenantId;
    return this.notificationsService.markAsRead(id, userId, orgId);
  }
}
