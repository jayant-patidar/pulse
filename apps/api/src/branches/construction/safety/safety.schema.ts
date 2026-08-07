import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum IncidentType {
  INJURY = 'INJURY',
  NEAR_MISS = 'NEAR_MISS',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  CLOSED = 'CLOSED',
}

@Schema({ timestamps: true, collection: 'con_safety_incidents' })
export class SafetyIncidentRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: IncidentType })
  declare incidentType: IncidentType;

  @Prop({ required: true, enum: IncidentSeverity })
  declare severity: IncidentSeverity;

  @Prop({ required: true })
  declare dateOccurred: Date;

  @Prop({ required: false })
  declare timeOccurred?: string;

  @Prop({ required: false })
  declare locationOnSite?: string;

  @Prop({ required: true })
  declare description: string;

  @Prop({ required: false })
  declare immediateActionsTaken?: string;

  @Prop({ type: [{ userId: { type: MongooseSchema.Types.ObjectId, ref: 'User' }, externalName: String, role: String }] })
  declare involvedParties: { userId?: MongooseSchema.Types.ObjectId; externalName?: string; role?: string }[];

  @Prop({ type: [{ name: String, contactInfo: String, statement: String }] })
  declare witnesses: { name: string; contactInfo?: string; statement?: string }[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Document' }] })
  declare photos: MongooseSchema.Types.ObjectId[];

  @Prop({ required: false })
  declare oshaRecordable?: boolean;

  @Prop({ type: { bodyPartAffected: String, injuryType: String, wasHospitalized: Boolean, daysAwayFromWork: Number, daysRestrictedTransfer: Number } })
  declare injuryDetails?: { bodyPartAffected?: string; injuryType?: string; wasHospitalized?: boolean; daysAwayFromWork?: number; daysRestrictedTransfer?: number };

  @Prop({ required: false })
  declare rootCauseAnalysis?: string;

  @Prop({ required: false })
  declare preventativeActions?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  declare investigatedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: IncidentStatus, default: IncidentStatus.OPEN })
  declare status: IncidentStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const SafetyIncidentSchema = SchemaFactory.createForClass(SafetyIncidentRecord);
