import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CorrectiveActionsService } from './corrective-actions.service';
import { CreateCorrectiveActionDto } from './dto/create-corrective-action.dto';
import { UpdateCorrectiveActionDto } from './dto/update-corrective-action.dto';
import { JwtAuthGuard } from '../../../root/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators';
import type { JwtPayload } from '@pulse/types';

@UseGuards(JwtAuthGuard)
@Controller('branches/inspection/corrective-actions')
export class CorrectiveActionsController {
  constructor(private readonly correctiveActionsService: CorrectiveActionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateCorrectiveActionDto) {
    return this.correctiveActionsService.create(user.org, createDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload, 
    @Query('projectId') projectId?: string,
    @Query('findingId') findingId?: string,
  ) {
    return this.correctiveActionsService.findAll(user.org, projectId, findingId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.correctiveActionsService.findOne(user.org, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateDto: UpdateCorrectiveActionDto) {
    return this.correctiveActionsService.update(user.org, id, updateDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.correctiveActionsService.remove(user.org, id);
  }
}
