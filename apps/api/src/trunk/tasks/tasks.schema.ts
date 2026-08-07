// ============================================================
// Task Schema — TRUNK Layer
// ============================================================
// See: Doc 05 §5.2
// ============================================================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'tasks' })
export class TaskDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  declare organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  declare projectId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 300 })
  declare title: string;

  @Prop({ maxlength: 10000 })
  declare description?: string;

  @Prop({ required: true, default: 'TODO', enum: ['TODO', 'IN_PROGRESS', 'BLOCKED', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] })
  declare status: string;

  @Prop({ required: true, default: 'MEDIUM', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  declare priority: string;

  // Assignment & Hierarchy
  @Prop({ type: [Types.ObjectId], default: [] })
  declare assigneeIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId })
  declare teamId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  declare parentTaskId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  declare dependencies: Types.ObjectId[];

  // Schedule & Tracking
  @Prop()
  declare dueDate?: Date;

  @Prop()
  declare actualStartDate?: Date;

  @Prop()
  declare actualEndDate?: Date;

  @Prop({ type: Number })
  declare estimatedHours?: number;

  @Prop({ type: Number })
  declare actualHours?: number;

  // Metadata
  @Prop({ type: [String], default: [] })
  declare tags: string[];

  @Prop({ type: [Types.ObjectId], default: [] })
  declare attachments: Types.ObjectId[];

  @Prop({ maxlength: 2000 })
  declare blockedReason?: string;

  // Audit & Soft Delete
  @Prop({ type: Types.ObjectId, required: true })
  declare createdBy: Types.ObjectId;

  @Prop({ type: Date, default: null })
  declare deletedAt?: Date;

  @Prop({ required: true })
  declare industry: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  declare extensions: Record<string, unknown>;
}

export const TaskSchema = SchemaFactory.createForClass(TaskDocument);

TaskSchema.index({ organizationId: 1, projectId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, assigneeIds: 1 });
TaskSchema.index({ organizationId: 1, createdAt: -1 });
TaskSchema.index({ organizationId: 1, dueDate: 1 });
