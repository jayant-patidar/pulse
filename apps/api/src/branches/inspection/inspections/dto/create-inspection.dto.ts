import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { InspectionType, InspectionResult, InspectionStatus } from '../inspection.schema';

export class CreateInspectionDto {
  @IsString()
  projectId: string;

  @IsEnum(InspectionType)
  inspectionType: InspectionType;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  inspectorNotes?: string;

  @IsOptional()
  @IsString()
  checklistId?: string;

  @IsOptional()
  @IsEnum(InspectionResult)
  overallResult?: InspectionResult;

  @IsOptional()
  @IsEnum(InspectionStatus)
  status?: InspectionStatus;
}
