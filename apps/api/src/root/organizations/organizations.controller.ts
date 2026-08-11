import { Controller, Get, Param, UseGuards, Patch, Req, Body } from '@nestjs/common';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { OrganizationsService } from './organizations.service';

@Controller('root/organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orgsService.findById(id);
  }

  @Patch('current')
  async updateCurrent(@Req() req: any, @Body() data: any) {
    const orgId = req.user.org;
    return this.orgsService.update(orgId, data);
  }
}
