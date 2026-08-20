import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus } from '../purchase-order.schema';

class PurchaseOrderLineItemDto {
  @IsString()
  materialDescription: string;

  @IsOptional()
  @IsString()
  costCode?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unitOfMeasure: string;

  @IsNumber()
  unitPriceCents: number;

  @IsNumber()
  totalCents: number;

  @IsOptional()
  @IsNumber()
  quantityReceived?: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  projectId: string;

  @IsString()
  poNumber: string;

  @IsString()
  supplierName: string;

  @IsOptional()
  @IsString()
  supplierContact?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineItemDto)
  lineItems: PurchaseOrderLineItemDto[];

  @IsNumber()
  totalAmountCents: number;

  @IsOptional()
  @IsDateString()
  deliveryDateExpected?: string;

  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
