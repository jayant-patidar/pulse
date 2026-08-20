import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@pulse/types';
import { CurrentUser } from '../../../common/decorators';
import { JwtAuthGuard } from '../../../root/auth/guards/jwt-auth.guard';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@UseGuards(JwtAuthGuard)
@Controller('branches/inspection/certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateCertificationDto) {
    return this.certificationsService.create(user.org, createDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload, 
    @Query('projectId') projectId?: string,
  ) {
    return this.certificationsService.findAll(user.org, projectId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.certificationsService.findOne(user.org, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateDto: UpdateCertificationDto) {
    return this.certificationsService.update(user.org, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.certificationsService.remove(user.org, id);
  }
}
