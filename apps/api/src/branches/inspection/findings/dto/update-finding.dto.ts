import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateFindingDto } from './create-finding.dto';

export class UpdateFindingDto extends PartialType(
  OmitType(CreateFindingDto, ['inspectionId', 'projectId'] as const),
) {}
