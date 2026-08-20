// ============================================================
// Documents Controller — TRUNK Layer
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
import { createDocumentSchema, updateDocumentSchema } from '@pulse/validators';
import { Response } from 'express';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { ZodValidationPipe } from '../../common/pipes';
import { DocumentsService } from './documents.service';

@Controller('trunk/documents')
@UseGuards(JwtAuthGuard, RbacGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @RequirePermissions('document:upload')
  @UsePipes(new ZodValidationPipe(createDocumentSchema))
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload & { ind: string }, @Body() dto: Record<string, unknown>) {
    return this.documentsService.create(user.org, user.sub, user.ind, dto);
  }

  @Get()
  @RequirePermissions('document:read')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: Record<string, string>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.documentsService.findAll(user.org, query);
    (res as any).__paginationMeta = result.meta;
    return result.docs;
  }

  @Get(':id')
  @RequirePermissions('document:read')
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.findById(user.org, id);
  }

  @Patch(':id')
  @RequirePermissions('document:upload')
  @UsePipes(new ZodValidationPipe(updateDocumentSchema))
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.documentsService.update(user.org, user.sub, id, dto);
  }

  @Post(':id/approve')
  @RequirePermissions('document:approve')
  @HttpCode(HttpStatus.OK)
  async approve(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.approve(user.org, user.sub, id);
  }

  @Delete(':id')
  @RequirePermissions('document:delete')
  @HttpCode(HttpStatus.OK)
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.documentsService.softDelete(user.org, user.sub, id);
  }
}
