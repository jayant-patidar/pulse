import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'organizations' })
export class OrganizationDocument extends Document {
  @Prop({ required: true })
  declare name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  declare slug: string;

  @Prop({ required: true, enum: ['CONSTRUCTION', 'AGRICULTURE', 'ENERGY', 'HVAC'] })
  declare industry: string;

  @Prop()
  declare logoUrl?: string;

  @Prop()
  declare contactEmail?: string;

  @Prop({ default: 'America/New_York' })
  declare timezone: string;

  @Prop({ type: [String], default: [] })
  declare allowedDomains: string[];

  // Elaborated Corporate Profile Fields
  @Prop()
  declare taxId?: string;

  @Prop()
  declare foundedYear?: number;

  @Prop()
  declare website?: string;

  @Prop({ type: Object })
  declare headquarters?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };

  @Prop({ type: [String], default: [] })
  declare specialties: string[];

  @Prop({ type: [Object], default: [] })
  declare licenses: Array<{
    number: string;
    state: string;
    expirationDate: Date;
  }>;

  @Prop({ default: 'USD' })
  declare currency: string;

  @Prop({
    type: Object,
    default: {
      defaultDateFormat: 'MM/DD/YYYY',
      fiscalYearStartMonth: 1,
      requireApprovalForReports: false,
      enforce2FAForAdmins: false,
    },
  })
  declare settings: Record<string, unknown>;

  @Prop({
    type: Object,
    default: {
      tier: 'FREE',
      status: 'TRIAL',
      maxUsers: 15,
      storageQuotaBytes: 5_368_709_120,
      storageUsedBytes: 0,
    },
  })
  declare billing: Record<string, unknown>;
}

export const OrganizationSchema = SchemaFactory.createForClass(OrganizationDocument);
OrganizationSchema.index({ slug: 1 });
