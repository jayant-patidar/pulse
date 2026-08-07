import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLogDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  declare organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  declare userId?: Types.ObjectId;

  @Prop({ required: true })
  declare action: string;

  @Prop({ required: true })
  declare resource: string;

  @Prop({ type: Types.ObjectId })
  declare resourceId?: Types.ObjectId;

  @Prop({ type: Object })
  declare changes?: Record<string, unknown>;

  @Prop()
  declare ipAddress?: string;

  @Prop()
  declare userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLogDocument);
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, resource: 1, resourceId: 1 });
