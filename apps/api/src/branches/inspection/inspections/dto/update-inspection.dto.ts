import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInspectionDto } from './create-inspection.dto';

export class UpdateInspectionDto extends PartialType(
  OmitType(CreateInspectionDto, ['projectId'] as const),
) {}
