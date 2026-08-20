import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CorrectiveActionStatus } from '../corrective-action.schema';

export class CreateCorrectiveActionDto {
  @IsString()
  findingId: string;

  @IsString()
  inspectionId: string;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsString()
  description: string;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsEnum(CorrectiveActionStatus)
  status?: CorrectiveActionStatus;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsDateString()
  verifiedDate?: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;
}
