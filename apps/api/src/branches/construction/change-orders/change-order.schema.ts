import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ChangeOrderStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVISE = 'REVISE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ChangeOrderReason {
  OWNER_REQUEST = 'OWNER_REQUEST',
  DESIGN_CHANGE = 'DESIGN_CHANGE',
  UNFORESEEN_CONDITION = 'UNFORESEEN_CONDITION',
  CODE_REQUIREMENT = 'CODE_REQUIREMENT',
  ERROR_OMISSION = 'ERROR_OMISSION',
}

@Schema({ timestamps: true, collection: 'con_change_orders' })
export class ChangeOrderRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  declare coNumber: string;

  @Prop({ required: true })
  declare title: string;

  @Prop({ required: false })
  declare description?: string;

  @Prop({ required: true, enum: ChangeOrderReason })
  declare reasonCode: ChangeOrderReason;

  @Prop({ required: true, enum: ChangeOrderStatus, default: ChangeOrderStatus.DRAFT })
  declare status: ChangeOrderStatus;

  @Prop({ required: true, default: 0 })
  declare costImpactCents: number;

  @Prop({ required: true, default: 0 })
  declare scheduleImpactDays: number;

  @Prop({ type: [{ description: String, costCode: String, quantity: Number, unitPriceCents: Number, totalCents: Number }] })
  declare lineItems: { description: string; costCode?: string; quantity: number; unitPriceCents: number; totalCents: number }[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Document' }] })
  declare attachments: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  declare requestedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  declare approvedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  declare approvedAt?: Date;

  @Prop({ required: false })
  declare clientApprovalRequired?: boolean;

  @Prop({ required: false })
  declare clientApprovedAt?: Date;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const ChangeOrderSchema = SchemaFactory.createForClass(ChangeOrderRecord);
