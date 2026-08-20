import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { InputStatus, InputType } from '../input-inventory.schema';

export class CreateInputDto {
  @IsEnum(InputType)
  inputType: InputType;

  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsNumber()
  quantityOnHand: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  costPerUnitCents?: number;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  epaRegistrationNumber?: string;

  @IsOptional()
  @IsEnum(InputStatus)
  status?: InputStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
