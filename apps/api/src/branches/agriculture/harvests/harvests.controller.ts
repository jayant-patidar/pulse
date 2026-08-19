import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { CreateHarvestLogDto } from './dto/create-harvest-log.dto';
import { UpdateHarvestLogDto } from './dto/update-harvest-log.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('branches/agriculture/harvests')
@UseGuards(JwtAuthGuard)
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @Post()
  create(@Body() createDto: CreateHarvestLogDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.harvestsService.create(createDto, orgId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    if (!projectId) throw new Error('projectId query parameter is required');
    return this.harvestsService.findAll(orgId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.harvestsService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateHarvestLogDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.harvestsService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.harvestsService.remove(id, orgId);
  }
}
