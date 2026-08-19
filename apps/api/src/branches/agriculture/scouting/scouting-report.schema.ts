import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ObservationType {
  PEST = 'PEST',
  DISEASE = 'DISEASE',
  WEED = 'WEED',
  NUTRIENT_DEFICIENCY = 'NUTRIENT_DEFICIENCY',
  WEATHER_DAMAGE = 'WEATHER_DAMAGE',
}

export enum ScoutingSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ScoutingStatus {
  OPEN = 'OPEN',
  TREATED = 'TREATED',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true, collection: 'agr_scouting_reports' })
export class ScoutingReportRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'CropCycleRecord', index: true })
  declare cropCycleId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  declare scoutDate: Date;

  @Prop({ required: false })
  declare fieldZone?: string;

  @Prop({ required: true, enum: ObservationType })
  declare observationType: ObservationType;

  @Prop({ required: true, enum: ScoutingSeverity })
  declare severity: ScoutingSeverity;

  @Prop({ required: true })
  declare description: string;

  @Prop({ required: false })
  declare recommendation?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Document' }] })
  declare photos: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true, enum: ScoutingStatus, default: ScoutingStatus.OPEN })
  declare status: ScoutingStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const ScoutingReportSchema = SchemaFactory.createForClass(ScoutingReportRecord);
