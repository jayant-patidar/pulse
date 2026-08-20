import { IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CoiPolicyType, CoiStatus } from '../coi.schema';

export class CreateCoiDto {
  @IsOptional()
  @IsString()
  subcontractorOrgId?: string;

  @IsOptional()
  @IsString()
  subcontractorName?: string;

  @IsEnum(CoiPolicyType)
  policyType: CoiPolicyType;

  @IsString()
  carrierName: string;

  @IsString()
  policyNumber: string;

  @IsOptional()
  @IsNumber()
  perOccurrenceLimitCents?: number;

  @IsOptional()
  @IsNumber()
  aggregateLimitCents?: number;

  @IsDateString()
  effectiveDate: string;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsEnum(CoiStatus)
  status?: CoiStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectSpecificIds?: string[];

  @IsOptional()
  @IsString()
  documentId?: string;
}
