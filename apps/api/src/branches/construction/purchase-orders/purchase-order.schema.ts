import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'con_purchase_orders' })
export class PurchaseOrderRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  declare poNumber: string;

  @Prop({ required: true })
  declare supplierName: string;

  @Prop({ required: false })
  declare supplierContact?: string;

  @Prop({ required: true, enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  declare status: PurchaseOrderStatus;

  @Prop({ type: [{ materialDescription: String, costCode: String, quantity: Number, unitOfMeasure: String, unitPriceCents: Number, totalCents: Number, quantityReceived: { type: Number, default: 0 } }] })
  declare lineItems: { materialDescription: string; costCode?: string; quantity: number; unitOfMeasure: string; unitPriceCents: number; totalCents: number; quantityReceived: number }[];

  @Prop({ required: true, default: 0 })
  declare totalAmountCents: number;

  @Prop({ required: false })
  declare deliveryDateExpected?: Date;

  @Prop({ required: false })
  declare deliveryLocation?: string;

  @Prop({ required: false })
  declare paymentTerms?: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  declare issuedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Document' }] })
  declare attachments: MongooseSchema.Types.ObjectId[];

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrderRecord);
