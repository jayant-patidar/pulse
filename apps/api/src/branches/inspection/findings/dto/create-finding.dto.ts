import { IsString, IsEnum, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { FindingType, FindingSeverity, FindingStatus } from '../finding.schema';

export class CreateFindingDto {
  @IsString()
  inspectionId: string;

  @IsString()
  projectId: string;

  @IsEnum(FindingType)
  findingType: FindingType;

  @IsEnum(FindingSeverity)
  severity: FindingSeverity;

  @IsOptional()
  @IsString()
  codeReference?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  photosRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsEnum(FindingStatus)
  status?: FindingStatus;
}
