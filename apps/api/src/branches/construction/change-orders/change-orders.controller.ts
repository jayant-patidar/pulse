import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ChangeOrdersService } from './change-orders.service';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderDto } from './dto/update-change-order.dto';

@Controller('construction/change-orders')
@UseGuards(JwtAuthGuard)
export class ChangeOrdersController {
  constructor(private readonly coService: ChangeOrdersService) {}

  @Post()
  create(@Body() createDto: CreateChangeOrderDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    const userId = (req.user as any).sub;
    return this.coService.create(createDto, orgId, userId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coService.findAll(orgId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateChangeOrderDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.coService.remove(id, orgId);
  }
}
