import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHarvestLogDto } from './create-harvest-log.dto';

export class UpdateHarvestLogDto extends PartialType(
  OmitType(CreateHarvestLogDto, ['projectId'] as const)
) {}
