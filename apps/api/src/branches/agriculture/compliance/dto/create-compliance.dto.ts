import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplianceStatus, ComplianceType } from '../agr-compliance.schema';

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
