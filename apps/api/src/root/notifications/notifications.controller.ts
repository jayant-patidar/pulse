import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service'; // Service import

@Controller('root/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const orgId = (req.user as any).org;
    return this.notificationsService.getUserNotifications(userId, orgId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const orgId = (req.user as any).org;
    return this.notificationsService.markAllAsRead(userId, orgId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).sub;
    const orgId = (req.user as any).org;
    return this.notificationsService.markAsRead(id, userId, orgId);
  }

  @Get('test-trigger')
  async triggerTestNotification(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const orgId = (req.user as any).org;
    
    return this.notificationsService.sendNotification({
      title: 'Test Notification',
      body: 'This is a test notification generated via the API to test WebSockets.',
      userId,
      organizationId: orgId,
    });
  }
}
