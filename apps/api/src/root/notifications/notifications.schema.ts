import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  URGENT = 'URGENT',
}

@Schema({ timestamps: true })
export class NotificationRecord extends Document {
  @Prop({ required: true })
  declare title: string;

  @Prop({ required: true })
  declare body: string;

  @Prop({ enum: NotificationType, default: NotificationType.INFO })
  declare type: NotificationType;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  declare userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  declare isRead: boolean;

  @Prop({ required: false })
  declare link?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationRecord);
