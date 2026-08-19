import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCropCycleDto } from './create-crop-cycle.dto';

export class UpdateCropCycleDto extends PartialType(
  OmitType(CreateCropCycleDto, ['projectId'] as const)
) {}
