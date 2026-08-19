import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateComplianceDto } from './create-compliance.dto';

export class UpdateComplianceDto extends PartialType(
  OmitType(CreateComplianceDto, ['projectId'] as const)
) {}
