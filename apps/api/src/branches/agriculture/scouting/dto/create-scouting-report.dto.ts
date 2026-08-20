import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ObservationType, ScoutingSeverity, ScoutingStatus } from '../scouting-report.schema';

export class CreateScoutingReportDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  cropCycleId?: string;

  @IsDateString()
  scoutDate: string;

  @IsOptional()
  @IsString()
  fieldZone?: string;

  @IsEnum(ObservationType)
  observationType: ObservationType;

  @IsEnum(ScoutingSeverity)
  severity: ScoutingSeverity;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsEnum(ScoutingStatus)
  status?: ScoutingStatus;
}
