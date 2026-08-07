// ============================================================
// Daily Reports Controller — TRUNK Layer
// ============================================================
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, UsePipes,
  HttpCode, HttpStatus, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import { DailyReportsService } from './daily-reports.service';
import { createDailyReportSchema, updateDailyReportSchema } from '@pulse/validators';
import type { JwtPayload } from '@pulse/types';

@Controller('trunk/daily-reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class DailyReportsController {
  constructor(private readonly reportsService: DailyReportsService) {}

  @Post()
  @RequirePermissions('report:create')
  @UsePipes(new ZodValidationPipe(createDailyReportSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: Record<string, unknown>) {
    return this.reportsService.create(user.org, user.sub, 'CONSTRUCTION', dto);
  }

  @Get()
  @RequirePermissions('report:read')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reportsService.findAll(user.org, query);
    (res as any).__paginationMeta = result.meta;
    return result.docs;
  }

  @Get(':id')
  @RequirePermissions('report:read')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reportsService.findById(user.org, id);
  }

  @Patch(':id')
  @RequirePermissions('report:create')
  @UsePipes(new ZodValidationPipe(updateDailyReportSchema))
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.reportsService.update(user.org, user.sub, id, dto);
  }

  @Post(':id/submit')
  @RequirePermissions('report:create')
  @HttpCode(HttpStatus.OK)
  async submit(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reportsService.submit(user.org, user.sub, id);
  }

  @Post(':id/approve')
  @RequirePermissions('report:approve')
  @HttpCode(HttpStatus.OK)
  async approve(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reportsService.approve(user.org, user.sub, id);
  }

  @Delete(':id')
  @RequirePermissions('report:create')
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reportsService.softDelete(user.org, user.sub, id);
  }
}
