import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('branches/agriculture/compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  create(@Body() createDto: CreateComplianceDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.complianceService.create(createDto, orgId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    if (!projectId) throw new Error('projectId query parameter is required');
    return this.complianceService.findAll(orgId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.complianceService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateComplianceDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.complianceService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.complianceService.remove(id, orgId);
  }
}
