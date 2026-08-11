import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req, UnauthorizedException, Query } from '@nestjs/common';
import { JwtAuthGuard, RbacGuard } from '../../../common/guards';
import { CurrentUser, RequirePermissions } from '../../../common/decorators';
import { TimesheetsService } from './timesheets.service';
import { MembershipsService } from '../../../root/memberships/memberships.service';
import type { JwtPayload } from '@pulse/types';

@Controller('branches/construction/timesheets')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TimesheetsController {
  constructor(
    private readonly timesheetsService: TimesheetsService,
    private readonly membershipsService: MembershipsService
  ) {}

  @Post()
  @RequirePermissions('project:read') // Just need access to project
  async logTime(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { projectId: string; date: string; hoursWorked: number; costCode?: string }
  ) {
    const membership = await this.membershipsService.findByUserAndOrg(user.sub, user.org);
    if (!membership) throw new UnauthorizedException('Membership not found');

    return this.timesheetsService.logTime(membership._id.toString(), dto.projectId, dto);
  }

  @Get()
  @RequirePermissions('project:read')
  async getTimesheets(
    @CurrentUser() user: JwtPayload,
    @Query('projectId') projectId: string
  ) {
    if (!projectId) throw new Error('projectId is required');
    return this.timesheetsService.getTimesheets(user.sub, user.org, projectId);
  }

  @Patch(':id')
  @RequirePermissions('project:read') // Workers modify their own time
  async updateTime(
    @CurrentUser() user: JwtPayload,
    @Param('id') timesheetId: string,
    @Body() dto: { date: string; hoursWorked: number; costCode?: string }
  ) {
    const membership = await this.membershipsService.findByUserAndOrg(user.sub, user.org);
    if (!membership) throw new UnauthorizedException('Membership not found');

    return this.timesheetsService.updateTime(timesheetId, membership._id.toString(), dto);
  }

  @Patch(':id/status')
  @RequirePermissions('project:update') // Needs some higher perm, using project:update for now
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') timesheetId: string,
    @Body() dto: { status: string }
  ) {
    const membership = await this.membershipsService.findByUserAndOrg(user.sub, user.org);
    if (!membership) throw new UnauthorizedException('Membership not found');

    return this.timesheetsService.updateStatus(timesheetId, dto.status, membership._id.toString());
  }
}
