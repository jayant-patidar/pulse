import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CorrectiveActionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

@Schema({ timestamps: true, collection: 'ins_corrective_actions' })
export class CorrectiveActionRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Inspection', index: true })
  declare inspectionId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Finding', index: true })
  declare findingId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false })
  declare assignedTo?: string;

  @Prop({ required: true })
  declare description: string;

  @Prop({ required: true })
  declare deadline: Date;

  @Prop({ required: false })
  declare resolutionNotes?: string;

  @Prop({ required: false })
  declare verifiedDate?: Date;

  @Prop({ required: false })
  declare verifiedBy?: string;

  @Prop({ required: true, enum: CorrectiveActionStatus, default: CorrectiveActionStatus.PENDING })
  declare status: CorrectiveActionStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const CorrectiveActionSchema = SchemaFactory.createForClass(CorrectiveActionRecord);
