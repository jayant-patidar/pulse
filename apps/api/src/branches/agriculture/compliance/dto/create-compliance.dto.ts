import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ComplianceType, ComplianceStatus } from '../agr-compliance.schema';

export class CreateComplianceDto {
  @IsString()
  projectId: string;

  @IsEnum(ComplianceType)
  complianceType: ComplianceType;

  @IsString()
  issuingAuthority: string;

  @IsOptional()
  @IsString()
  certificationNumber?: string;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
