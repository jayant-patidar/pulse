import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CoiService } from './coi.service';
import { CreateCoiDto } from './dto/create-coi.dto';
import { UpdateCoiDto } from './dto/update-coi.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('construction/coi')
@UseGuards(JwtAuthGuard)
export class CoiController {
  constructor(private readonly coiService: CoiService) {}

  @Post()
  create(@Body() createDto: CreateCoiDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coiService.create(createDto, orgId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coiService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coiService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCoiDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coiService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coiService.remove(id, orgId);
  }
}
