import { IsString, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { InputType, InputStatus } from '../input-inventory.schema';

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
