import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { JwtAuthGuard } from '../../../root/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import type { JwtPayload } from '@pulse/types';

@UseGuards(JwtAuthGuard)
@Controller('branches/inspection/inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateInspectionDto) {
    return this.inspectionsService.create(user.org, createDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('projectId') projectId?: string) {
    return this.inspectionsService.findAll(user.org, projectId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.inspectionsService.findOne(user.org, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateDto: UpdateInspectionDto) {
    return this.inspectionsService.update(user.org, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.inspectionsService.remove(user.org, id);
  }
}
