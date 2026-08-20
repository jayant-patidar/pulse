import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCertificationDto } from './create-certification.dto';

export class UpdateCertificationDto extends PartialType(
  OmitType(CreateCertificationDto, ['projectId'] as const),
) {}
