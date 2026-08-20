import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FindingsService } from './findings.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { JwtAuthGuard } from '../../../root/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import type { JwtPayload } from '@pulse/types';

@UseGuards(JwtAuthGuard)
@Controller('branches/inspection/findings')
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateFindingDto) {
    return this.findingsService.create(user.org, createDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload, 
    @Query('inspectionId') inspectionId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.findingsService.findAll(user.org, inspectionId, projectId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.findingsService.findOne(user.org, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateDto: UpdateFindingDto) {
    return this.findingsService.update(user.org, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.findingsService.remove(user.org, id);
  }
}
