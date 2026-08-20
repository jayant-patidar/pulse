import { PartialType } from '@nestjs/mapped-types';
import { CreateHarvestLogDto } from './create-harvest-log.dto';

export class UpdateHarvestLogDto extends PartialType(
  CreateHarvestLogDto
) {}
