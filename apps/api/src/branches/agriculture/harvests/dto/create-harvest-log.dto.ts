import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateHarvestLogDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  cropCycleId?: string;

  @IsDateString()
  harvestDate: string;

  @IsOptional()
  @IsString()
  fieldZone?: string;

  @IsNumber()
  acresHarvested: number;

  @IsOptional()
  @IsNumber()
  yieldBushelsPerAcre?: number;

  @IsOptional()
  @IsNumber()
  moisturePercent?: number;

  @IsOptional()
  @IsString()
  grainQualityGrade?: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
