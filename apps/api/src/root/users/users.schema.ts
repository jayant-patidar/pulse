import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  declare email: string;

  @Prop({ required: true })
  declare passwordHash: string;

  @Prop({ required: true })
  declare firstName: string;

  @Prop({ required: true })
  declare lastName: string;

  @Prop()
  declare phone?: string;

  @Prop()
  declare avatarUrl?: string;

  @Prop({ default: false })
  declare isVerified: boolean;

  @Prop({ default: false })
  declare mustChangePassword: boolean;

  @Prop({ default: false })
  declare twoFactorEnabled: boolean;

  @Prop({ type: Object })
  declare oauth?: { googleId?: string; microsoftId?: string; appleId?: string };

  @Prop()
  declare lastLoginAt?: Date;

  @Prop({ default: 0 })
  declare loginCount: number;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Index for fast email lookups
UserSchema.index({ email: 1 });
