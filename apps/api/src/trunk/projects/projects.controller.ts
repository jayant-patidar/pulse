// ============================================================
// Projects Controller — TRUNK Layer
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
import { createProjectSchema, updateProjectSchema } from '@pulse/validators';
import { Response } from 'express';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { ProjectsService } from './projects.service';

@Controller('trunk/projects')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions('project:create')
  @UsePipes(new ZodValidationPipe(createProjectSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: JwtPayload & { ind: string },
    @Body() dto: Record<string, unknown>,
  ) {
    return this.projectsService.create(user.org, user.sub, user.ind, dto);
  }

  @Get()
  @RequirePermissions('project:read')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.projectsService.findAll(user.org, query);
    // Attach pagination meta to the response (interceptor wraps data)
    (res as any).__paginationMeta = result.meta;
    return result.docs;
  }

  @Get(':id')
  @RequirePermissions('project:read')
  async findById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.projectsService.findById(user.org, id);
  }

  @Patch(':id')
  @RequirePermissions('project:update')
  @UsePipes(new ZodValidationPipe(updateProjectSchema))
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.projectsService.update(user.org, user.sub, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('project:delete')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.projectsService.softDelete(user.org, user.sub, id);
  }
}
