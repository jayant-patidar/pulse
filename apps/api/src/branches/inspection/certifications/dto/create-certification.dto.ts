import { IsString, IsEnum, IsOptional, IsDateString, IsArray } from 'class-validator';
import { CertificationType, CertificationStatus } from '../certification.schema';

export class CreateCertificationDto {
  @IsString()
  projectId: string;

  @IsEnum(CertificationType)
  certificationType: CertificationType;

  @IsOptional()
  @IsString()
  certificationNumber?: string;

  @IsDateString()
  issuedDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsString()
  issuedBy: string;

  @IsOptional()
  @IsString()
  conditions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsEnum(CertificationStatus)
  status?: CertificationStatus;
}
