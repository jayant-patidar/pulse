// ============================================================
// Equipment Controller — TRUNK Layer
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
import { EquipmentService } from './equipment.service';
import { createEquipmentSchema, updateEquipmentSchema } from '@pulse/validators';
import type { JwtPayload } from '@pulse/types';

@Controller('trunk/equipment')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @RequirePermissions('equipment:manage')
  @UsePipes(new ZodValidationPipe(createEquipmentSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload & { ind: string }, @Body() dto: Record<string, unknown>) {
    return this.equipmentService.create(user.org, user.sub, user.ind, dto);
  }

  @Get()
  @RequirePermissions('equipment:manage')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const result = await this.equipmentService.findAll(user.org, query);
    (res as any).__paginationMeta = result.meta;
    return result.docs;
  }

  @Get(':id')
  @RequirePermissions('equipment:manage')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<any> {
    return this.equipmentService.findById(user.org, id);
  }

  @Patch(':id')
  @RequirePermissions('equipment:manage')
  @UsePipes(new ZodValidationPipe(updateEquipmentSchema))
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.equipmentService.update(user.org, user.sub, id, dto);
  }

  @Post(':id/assign')
  @RequirePermissions('equipment:manage')
  @HttpCode(HttpStatus.OK)
  async assign(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: { projectId: string },
  ) {
    return this.equipmentService.assignToProject(user.org, user.sub, id, dto.projectId);
  }

  @Delete(':id')
  @RequirePermissions('equipment:manage')
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.equipmentService.softDelete(user.org, user.sub, id);
  }
}
