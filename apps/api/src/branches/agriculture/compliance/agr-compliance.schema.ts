import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ComplianceType {
  ORGANIC_CERTIFICATION = 'ORGANIC_CERTIFICATION',
  EPA_REPORT = 'EPA_REPORT',
  WATER_USE_PERMIT = 'WATER_USE_PERMIT',
  SOIL_CONSERVATION_PLAN = 'SOIL_CONSERVATION_PLAN',
  CROP_INSURANCE = 'CROP_INSURANCE',
  OTHER = 'OTHER',
}

export enum ComplianceStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PENDING_RENEWAL = 'PENDING_RENEWAL',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true, collection: 'agr_compliance' })
export class AgrComplianceRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ComplianceType })
  declare complianceType: ComplianceType;

  @Prop({ required: true })
  declare issuingAuthority: string;

  @Prop({ required: false })
  declare certificationNumber?: string;

  @Prop({ required: true })
  declare effectiveDate: Date;

  @Prop({ required: false })
  declare expiryDate?: Date;

  @Prop({ required: true, enum: ComplianceStatus, default: ComplianceStatus.ACTIVE })
  declare status: ComplianceStatus;

  @Prop({ required: false })
  declare notes?: string;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const AgrComplianceSchema = SchemaFactory.createForClass(AgrComplianceRecord);
