import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ScoutingService } from './scouting.service';
import { CreateScoutingReportDto } from './dto/create-scouting-report.dto';
import { UpdateScoutingReportDto } from './dto/update-scouting-report.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('branches/agriculture/scouting')
@UseGuards(JwtAuthGuard)
export class ScoutingController {
  constructor(private readonly scoutingService: ScoutingService) {}

  @Post()
  create(@Body() createDto: CreateScoutingReportDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.scoutingService.create(createDto, orgId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    if (!projectId) throw new Error('projectId query parameter is required');
    return this.scoutingService.findAll(orgId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.scoutingService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateScoutingReportDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.scoutingService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.scoutingService.remove(id, orgId);
  }
}
