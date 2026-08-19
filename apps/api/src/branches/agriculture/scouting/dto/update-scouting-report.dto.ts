import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateScoutingReportDto } from './create-scouting-report.dto';

export class UpdateScoutingReportDto extends PartialType(
  OmitType(CreateScoutingReportDto, ['projectId'] as const)
) {}
