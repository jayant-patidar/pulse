// ============================================================
// Tasks Controller — TRUNK Layer
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
import { createTaskSchema, updateTaskSchema } from '@pulse/validators';
import { Response } from 'express';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { TasksService } from './tasks.service';

@Controller('trunk/tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions('task:create')
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload & { ind: string }, @Body() dto: Record<string, unknown>) {
    return this.tasksService.create(user.org, user.sub, user.ind, dto);
  }

  @Get()
  @RequirePermissions('task:read')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.tasksService.findAll(user.org, query);
    (res as any).__paginationMeta = result.meta;
    return result.docs;
  }

  @Get(':id')
  @RequirePermissions('task:read')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.findById(user.org, id);
  }

  @Patch(':id')
  @RequirePermissions('task:update')
  @UsePipes(new ZodValidationPipe(updateTaskSchema))
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.tasksService.update(user.org, user.sub, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('task:delete')
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tasksService.softDelete(user.org, user.sub, id);
  }
}
