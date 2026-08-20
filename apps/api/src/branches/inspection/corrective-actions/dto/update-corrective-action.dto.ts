import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCorrectiveActionDto } from './create-corrective-action.dto';

export class UpdateCorrectiveActionDto extends PartialType(
  OmitType(CreateCorrectiveActionDto, ['findingId', 'inspectionId', 'projectId'] as const),
) {}
