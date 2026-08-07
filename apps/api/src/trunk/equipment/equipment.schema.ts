// ============================================================
// Equipment Schema — TRUNK Layer
// ============================================================
// See: Doc 05 §5.5
// ============================================================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'equipment' })
export class EquipmentDocument extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  declare organizationId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  declare name: string;

  @Prop({ maxlength: 100 })
  declare assetTag?: string;

  @Prop({ maxlength: 100 })
  declare make?: string;

  @Prop({ maxlength: 100 })
  declare modelName?: string;

  @Prop({ type: Number })
  declare year?: number;

  @Prop({ maxlength: 200 })
  declare serialNumber?: string;

  @Prop({ required: true, default: 'AVAILABLE', enum: ['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'] })
  declare status: string;

  // Current Assignment
  @Prop({ type: MongooseSchema.Types.ObjectId })
  declare currentProjectId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  declare currentAssigneeId?: Types.ObjectId;

  // Financials
  @Prop()
  declare purchaseDate?: Date;

  @Prop({ type: Number })
  declare purchasePriceCents?: number;

  @Prop({ type: Number })
  declare hourlyInternalCostCents?: number;

  // Maintenance Tracking
  @Prop({ type: Object })
  declare maintenanceSchedule?: {
    intervalType: string;
    intervalValue: number;
    lastMaintenanceDate?: Date;
    lastMaintenanceMetric?: number;
  };

  // Audit & Soft Delete
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  declare createdBy: Types.ObjectId;

  @Prop({ type: Date, default: null })
  declare deletedAt?: Date;

  @Prop({ required: true })
  declare industry: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  declare extensions: Record<string, unknown>;
}

export const EquipmentSchema = SchemaFactory.createForClass(EquipmentDocument);

EquipmentSchema.index({ organizationId: 1, status: 1 });
EquipmentSchema.index({ organizationId: 1, assetTag: 1 }, { unique: true, sparse: true });
EquipmentSchema.index({ organizationId: 1, currentProjectId: 1 });
