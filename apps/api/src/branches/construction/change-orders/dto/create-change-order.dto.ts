import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ChangeOrderReason, ChangeOrderStatus } from '../change-order.schema';

class ChangeOrderLineItemDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  costCode?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPriceCents: number;

  @IsNumber()
  totalCents: number;
}

export class CreateChangeOrderDto {
  @IsString()
  projectId: string;

  @IsString()
  coNumber: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ChangeOrderReason)
  reasonCode: ChangeOrderReason;

  @IsOptional()
  @IsEnum(ChangeOrderStatus)
  status?: ChangeOrderStatus;

  @IsNumber()
  costImpactCents: number;

  @IsNumber()
  scheduleImpactDays: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeOrderLineItemDto)
  lineItems: ChangeOrderLineItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsBoolean()
  clientApprovalRequired?: boolean;
}
