import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentType, IncidentSeverity, IncidentStatus } from '../safety.schema';

class InvolvedPartyDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  externalName?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

class WitnessDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsString()
  statement?: string;
}

class InjuryDetailsDto {
  @IsOptional()
  @IsString()
  bodyPartAffected?: string;

  @IsOptional()
  @IsString()
  injuryType?: string;

  @IsOptional()
  @IsBoolean()
  wasHospitalized?: boolean;

  @IsOptional()
  @IsNumber()
  daysAwayFromWork?: number;

  @IsOptional()
  @IsNumber()
  daysRestrictedTransfer?: number;
}

export class CreateSafetyIncidentDto {
  @IsString()
  projectId: string;

  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsDateString()
  dateOccurred: string;

  @IsOptional()
  @IsString()
  timeOccurred?: string;

  @IsOptional()
  @IsString()
  locationOnSite?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  immediateActionsTaken?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvolvedPartyDto)
  involvedParties?: InvolvedPartyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WitnessDto)
  witnesses?: WitnessDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsBoolean()
  oshaRecordable?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => InjuryDetailsDto)
  injuryDetails?: InjuryDetailsDto;

  @IsOptional()
  @IsString()
  rootCauseAnalysis?: string;

  @IsOptional()
  @IsString()
  preventativeActions?: string;

  @IsOptional()
  @IsString()
  investigatedBy?: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
