import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CropCyclesService } from './crop-cycles.service';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';

@Controller('branches/agriculture/crop-cycles')
@UseGuards(JwtAuthGuard)
export class CropCyclesController {
  constructor(private readonly cropCyclesService: CropCyclesService) {}

  @Post()
  create(@Body() createDto: CreateCropCycleDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.cropCyclesService.create(createDto, orgId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    if (!projectId) throw new Error('projectId query parameter is required');
    return this.cropCyclesService.findAll(orgId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.cropCyclesService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCropCycleDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.cropCyclesService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.cropCyclesService.remove(id, orgId);
  }
}
