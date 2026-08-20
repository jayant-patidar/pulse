import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum InspectionType {
  STRUCTURAL = 'STRUCTURAL',
  ELECTRICAL = 'ELECTRICAL',
  PLUMBING = 'PLUMBING',
  FIRE_SAFETY = 'FIRE_SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  ELEVATOR = 'ELEVATOR',
  HEALTH = 'HEALTH',
  CODE_ENFORCEMENT = 'CODE_ENFORCEMENT',
}

export enum InspectionResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL = 'CONDITIONAL',
  PENDING = 'PENDING',
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'ins_inspections' })
export class InspectionRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: InspectionType })
  declare inspectionType: InspectionType;

  @Prop({ required: true })
  declare scheduledDate: Date;

  @Prop({ required: false })
  declare scope?: string;

  @Prop({ required: false })
  declare inspectorNotes?: string;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId })
  declare checklistId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, enum: InspectionResult, default: InspectionResult.PENDING })
  declare overallResult?: InspectionResult;

  @Prop({ required: true, enum: InspectionStatus, default: InspectionStatus.SCHEDULED })
  declare status: InspectionStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const InspectionSchema = SchemaFactory.createForClass(InspectionRecord);
