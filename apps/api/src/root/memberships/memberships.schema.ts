import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'memberships' })
export class MembershipDocument extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument', required: true })
  declare userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'OrganizationDocument', required: true })
  declare organizationId: Types.ObjectId;

  @Prop({ required: true, enum: ['OWNER', 'ADMIN', 'MANAGER', 'SUPERVISOR', 'WORKER', 'CONTRACTOR'] })
  declare role: string;

  @Prop({ default: 'ACTIVE', enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'DECLINED'] })
  declare status: string;

  @Prop()
  declare invitationToken?: string;

  @Prop()
  declare invitationExpiresAt?: Date;

  @Prop({ type: [{ projectId: MongooseSchema.Types.ObjectId, role: String }], default: [] })
  declare projectRoles: Array<{ projectId: Types.ObjectId; role: string }>;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  declare teamIds: Types.ObjectId[];

  @Prop({
    type: Object,
    default: { emailDigest: 'DAILY', pushEnabled: true, smsEnabled: false, mutedEntities: [] },
  })
  declare notificationPreferences: Record<string, unknown>;
}

export const MembershipSchema = SchemaFactory.createForClass(MembershipDocument);
MembershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
MembershipSchema.index({ organizationId: 1, status: 1 });
