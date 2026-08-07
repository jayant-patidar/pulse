import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CoiPolicyType {
  GENERAL_LIABILITY = 'GENERAL_LIABILITY',
  WORKERS_COMP = 'WORKERS_COMP',
  AUTO = 'AUTO',
  UMBRELLA = 'UMBRELLA',
  PROFESSIONAL = 'PROFESSIONAL',
}

export enum CoiStatus {
  COMPLIANT = 'COMPLIANT',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true, collection: 'con_coi' })
export class CoiRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Organization' })
  declare subcontractorOrgId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  declare subcontractorName?: string;

  @Prop({ required: true, enum: CoiPolicyType })
  declare policyType: CoiPolicyType;

  @Prop({ required: true })
  declare carrierName: string;

  @Prop({ required: true })
  declare policyNumber: string;

  @Prop({ required: false })
  declare perOccurrenceLimitCents?: number;

  @Prop({ required: false })
  declare aggregateLimitCents?: number;

  @Prop({ required: true })
  declare effectiveDate: Date;

  @Prop({ required: true })
  declare expiryDate: Date;

  @Prop({ required: true, enum: CoiStatus, default: CoiStatus.COMPLIANT })
  declare status: CoiStatus;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }] })
  declare projectSpecificIds: MongooseSchema.Types.ObjectId[];

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Document' })
  declare documentId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  declare verifiedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const CoiSchema = SchemaFactory.createForClass(CoiRecord);
