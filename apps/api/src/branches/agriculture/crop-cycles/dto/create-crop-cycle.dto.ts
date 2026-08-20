import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CropCycleStatus } from '../crop-cycle.schema';

export class CreateCropCycleDto {
  @IsString()
  projectId: string;

  @IsString()
  fieldName: string;

  @IsString()
  cropType: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsDateString()
  plantingDate: string;

  @IsOptional()
  @IsDateString()
  expectedHarvestDate?: string;

  @IsOptional()
  @IsNumber()
  acreage?: number;

  @IsOptional()
  @IsNumber()
  seedRatePerAcre?: number;

  @IsOptional()
  @IsNumber()
  rowSpacingInches?: number;

  @IsOptional()
  @IsEnum(CropCycleStatus)
  status?: CropCycleStatus;
}
