import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from './organizations.service';

@Controller('root/organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orgsService.findById(id);
  }
}
