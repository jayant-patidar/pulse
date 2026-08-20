// ============================================================
// Daily Reports Controller — TRUNK Layer
// ============================================================
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards, UsePipes,
} from '@nestjs/common';
import type { JwtPayload } from '@pulse/types';
import { createDailyReportSchema, updateDailyReportSchema } from '@pulse/validators';
import { Response } from 'express';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { DailyReportsService } from './daily-reports.service';

@Controller('trunk/daily-reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class DailyReportsController {
  constructor(private readonly reportsService: DailyReportsService) {}

  @Post()
  @RequirePermissions('report:create')
  @UsePipes(new ZodValidationPipe(createDailyReportSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload & { ind: string }, @Body() dto: Record<string, unknown>) {
    return this.reportsService.create(user.org, user.sub, user.ind, dto);
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
