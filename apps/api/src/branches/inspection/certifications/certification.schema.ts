import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CertificationType {
  OCCUPANCY_PERMIT = 'OCCUPANCY_PERMIT',
  FIRE_CLEARANCE = 'FIRE_CLEARANCE',
  HEALTH_PERMIT = 'HEALTH_PERMIT',
  ELEVATOR_CERT = 'ELEVATOR_CERT',
  ENVIRONMENTAL_CLEARANCE = 'ENVIRONMENTAL_CLEARANCE',
  CODE_COMPLIANCE = 'CODE_COMPLIANCE',
  OTHER = 'OTHER',
}

export enum CertificationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
}

@Schema({ timestamps: true, collection: 'ins_certifications' })
export class CertificationRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: CertificationType })
  declare certificationType: CertificationType;

  @Prop({ required: false })
  declare certificationNumber?: string;

  @Prop({ required: true })
  declare issuedDate: Date;

  @Prop({ required: false })
  declare expiryDate?: Date;

  @Prop({ required: true })
  declare issuedBy: string;

  @Prop({ required: false })
  declare conditions?: string;

  @Prop({ required: false, type: [String] })
  declare documents?: string[];

  @Prop({ required: true, enum: CertificationStatus, default: CertificationStatus.ACTIVE })
  declare status: CertificationStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const CertificationSchema = SchemaFactory.createForClass(CertificationRecord);
