import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum FindingType {
  VIOLATION = 'VIOLATION',
  DEFICIENCY = 'DEFICIENCY',
  OBSERVATION = 'OBSERVATION',
  RECOMMENDATION = 'RECOMMENDATION',
}

export enum FindingSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  INFO = 'INFO',
}

export enum FindingStatus {
  OPEN = 'OPEN',
  IN_REMEDIATION = 'IN_REMEDIATION',
  REINSPECTION_NEEDED = 'REINSPECTION_NEEDED',
  RESOLVED = 'RESOLVED',
  WAIVED = 'WAIVED',
}

@Schema({ timestamps: true, collection: 'ins_findings' })
export class FindingRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Inspection', index: true })
  declare inspectionId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: FindingType })
  declare findingType: FindingType;

  @Prop({ required: true, enum: FindingSeverity })
  declare severity: FindingSeverity;

  @Prop({ required: false })
  declare codeReference?: string;

  @Prop({ required: false })
  declare location?: string;

  @Prop({ required: true })
  declare description: string;

  @Prop({ required: false, default: false })
  declare photosRequired?: boolean;

  @Prop({ required: false, type: [String] })
  declare photos?: string[];

  @Prop({ required: true, enum: FindingStatus, default: FindingStatus.OPEN })
  declare status: FindingStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const FindingSchema = SchemaFactory.createForClass(FindingRecord);
