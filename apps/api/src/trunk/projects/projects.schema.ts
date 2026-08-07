// ============================================================
// Project Schema — TRUNK Layer
// ============================================================
// Core work organization entity. Extensions are validated
// dynamically by the active Branch plugin.
// See: Doc 05 §5.1
// ============================================================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'projects' })
export class ProjectDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  declare organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  declare name: string;

  @Prop({ maxlength: 5000 })
  declare description?: string;

  @Prop({ required: true, default: 'DRAFT', enum: ['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] })
  declare status: string;

  // Location (GeoJSON Point)
  @Prop({ type: Object })
  declare location?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };

  // Schedule
  @Prop()
  declare startDate?: Date;

  @Prop()
  declare targetEndDate?: Date;

  @Prop()
  declare actualEndDate?: Date;

  // Financials (stored in cents to prevent float errors)
  @Prop({ type: Number })
  declare budget?: number;

  @Prop({ type: Number, default: 0 })
  declare committedCost?: number;

  @Prop({ type: Number, default: 0 })
  declare actualCost?: number;

  // Team & Client
  @Prop({ type: Types.ObjectId })
  declare clientId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  declare managerIds: Types.ObjectId[];

  // Audit & Soft Delete
  @Prop({ type: Types.ObjectId, required: true })
  declare createdBy: Types.ObjectId;

  @Prop({ type: Date, default: null })
  declare deletedAt?: Date;

  @Prop({ required: true })
  declare industry: string;

  // Branch-specific data (validated dynamically by Extension plugins)
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  declare extensions: Record<string, unknown>;
}

export const ProjectSchema = SchemaFactory.createForClass(ProjectDocument);

// Multi-tenant compound indexes
ProjectSchema.index({ organizationId: 1, status: 1 });
ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1, createdAt: -1 });
ProjectSchema.index({ organizationId: 1, managerIds: 1 });
