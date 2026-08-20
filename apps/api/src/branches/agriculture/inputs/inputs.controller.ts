import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateInputDto } from './dto/create-input.dto';
import { UpdateInputDto } from './dto/update-input.dto';
import { InputsService } from './inputs.service';

@Controller('branches/agriculture/inputs')
@UseGuards(JwtAuthGuard)
export class InputsController {
  constructor(private readonly inputsService: InputsService) {}

  @Post()
  create(@Body() createDto: CreateInputDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.inputsService.create(createDto, orgId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.inputsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.inputsService.findOne(id, orgId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateInputDto, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.inputsService.update(id, updateDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const orgId = (req.user as any).org;
    return this.inputsService.remove(id, orgId);
  }
}
