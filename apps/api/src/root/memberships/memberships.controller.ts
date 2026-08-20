// ============================================================
// Memberships Controller — Invitation & Team Management
// ============================================================
// Endpoints for inviting users, listing members, and managing roles.
// Protected by JwtAuthGuard + RbacGuard.
// ============================================================
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { JwtPayload } from '@pulse/types';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { MembershipsService } from './memberships.service';

@Controller('root/memberships')
@UseGuards(JwtAuthGuard, RbacGuard)
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  /**
   * Invite a new member to the organization.
   * Requires USER_INVITE permission.
   */
  @Post('invite')
  @RequirePermissions('user:invite')
  async invite(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { email: string; role: string },
  ) {
    return this.membershipsService.invite(user.org, dto.email, dto.role, user.sub);
  }

  /**
   * Onboard a new employee.
   * Requires USER_INVITE permission.
   */
  @Post('onboard')
  @RequirePermissions('user:invite')
  async onboard(
    @CurrentUser() user: JwtPayload,
    @Body() dto: { firstName: string; lastName: string; role: string; employmentType: string; reportsTo?: string },
  ) {
    return this.membershipsService.onboardEmployee(user.org, user.sub, dto);
  }

  /**
   * List all members in the current organization.
   */
  @Get()
  @RequirePermissions('org:read')
  async listMembers(@CurrentUser() user: JwtPayload) {
    return this.membershipsService.findByOrg(user.org);
  }

  /**
   * Update a member's role.
   * Requires USER_MANAGE_ROLES permission.
   */
  @Patch(':membershipId/role')
  @RequirePermissions('user:manage_roles')
  async updateRole(
    @CurrentUser() user: JwtPayload,
    @Param('membershipId') membershipId: string,
    @Body() dto: { role: string },
  ) {
    return this.membershipsService.updateRole(membershipId, dto.role, user.org);
  }

  /**
   * Reset an employee's password and force them to change it on next login.
   * Requires USER_MANAGE_ROLES permission.
   */
  @Patch(':membershipId/reset-password')
  @RequirePermissions('user:manage_roles')
  async resetPassword(
    @CurrentUser() user: JwtPayload,
    @Param('membershipId') membershipId: string,
  ) {
    return this.membershipsService.resetEmployeePassword(membershipId, user.org, user.sub);
  }

  /**
   * Remove (deactivate) a member from the organization.
   * Requires USER_MANAGE_ROLES permission.
   */
  @Delete(':membershipId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('user:manage_roles')
  async removeMember(
    @CurrentUser() user: JwtPayload,
    @Param('membershipId') membershipId: string,
  ) {
    return this.membershipsService.deactivate(membershipId, user.org);
  }
}
