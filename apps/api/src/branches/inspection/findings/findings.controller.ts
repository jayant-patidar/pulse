import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@pulse/types';
import { CurrentUser } from '../../../common/decorators';
import { JwtAuthGuard } from '../../../root/auth/guards/jwt-auth.guard';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { FindingsService } from './findings.service';

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
