// ============================================================
// Daily Report Schema — TRUNK Layer
// ============================================================
// See: Doc 05 §5.3
// ============================================================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'daily_reports' })
export class DailyReportDocument extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  declare organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  declare projectId: Types.ObjectId;

  @Prop({ required: true })
  declare date: Date;

  @Prop({ required: true, default: 'DRAFT', enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] })
  declare status: string;

  // Weather
  @Prop({ type: Object })
  declare weather?: {
    condition?: string;
    temperatureF?: number;
    windMph?: number;
    precipitationInches?: number;
  };

  // Labor
  @Prop({ type: Number })
  declare totalWorkerCount?: number;

  @Prop({ type: Number })
  declare totalHoursWorked?: number;

  // Activities & Issues
  @Prop({ maxlength: 20000 })
  declare activitiesDescription?: string;

  @Prop({ type: [{ category: String, description: String, impactLevel: String }], default: [] })
  declare issues: Array<{ category: string; description: string; impactLevel?: string }>;

  @Prop({ type: [{ cause: String, hoursLost: Number, description: String }], default: [] })
  declare delays: Array<{ cause: string; hoursLost: number; description?: string }>;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  declare photos: Types.ObjectId[];

  @Prop({ maxlength: 10000 })
  declare notes?: string;

  // Audit & Soft Delete
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  declare createdBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  declare approvedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  declare deletedAt?: Date;

  @Prop({ required: true })
  declare industry: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  declare extensions: Record<string, unknown>;
}

export const DailyReportSchema = SchemaFactory.createForClass(DailyReportDocument);

DailyReportSchema.index({ organizationId: 1, projectId: 1, date: -1 });
DailyReportSchema.index({ organizationId: 1, status: 1 });
DailyReportSchema.index({ organizationId: 1, createdBy: 1 });
