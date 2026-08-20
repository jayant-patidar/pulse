import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateSafetyIncidentDto } from './dto/create-safety-incident.dto';
import { UpdateSafetyIncidentDto } from './dto/update-safety-incident.dto';
import { SafetyService } from './safety.service';

@Controller('construction/safety')
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post()
  create(@Body() createDto: CreateSafetyIncidentDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.safetyService.create(createDto, orgId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.safetyService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.safetyService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSafetyIncidentDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.safetyService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.safetyService.remove(id, orgId);
  }
}
