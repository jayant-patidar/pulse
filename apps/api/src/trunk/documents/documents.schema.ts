// ============================================================
// Document Schema — TRUNK Layer
// ============================================================
// See: Doc 05 §5.4
// ============================================================
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentRecord extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  declare organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  declare projectId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 500 })
  declare name: string;

  @Prop({ required: true, maxlength: 500 })
  declare originalFilename: string;

  @Prop({ required: true, maxlength: 200 })
  declare fileType: string;

  @Prop({ required: true, type: Number })
  declare sizeBytes: number;

  @Prop({ default: '' })
  declare s3Key: string;

  // Versioning
  @Prop({ type: Number, default: 1 })
  declare version: number;

  @Prop({ type: Types.ObjectId })
  declare parentDocumentId?: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  declare isLatest: boolean;

  // Organization
  @Prop({ type: Types.ObjectId })
  declare folderId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  declare tags: string[];

  // Approval Workflow
  @Prop({ default: 'NONE', enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  declare approvalStatus: string;

  @Prop({ type: Types.ObjectId })
  declare approvedBy?: Types.ObjectId;

  // EXIF / Metadata
  @Prop({ type: Object })
  declare metadata?: {
    gpsCoordinates?: [number, number];
    captureDate?: Date;
    cameraMake?: string;
  };

  // AI Vector Data
  @Prop({ default: 'PENDING', enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'SKIPPED'] })
  declare aiStatus: string;

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

export const DocumentSchema = SchemaFactory.createForClass(DocumentRecord);

DocumentSchema.index({ organizationId: 1, projectId: 1 });
DocumentSchema.index({ organizationId: 1, folderId: 1 });
DocumentSchema.index({ organizationId: 1, tags: 1 });
DocumentSchema.index({ organizationId: 1, createdAt: -1 });
