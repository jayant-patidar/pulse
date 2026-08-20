import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'timesheets' })
export class TimesheetDocument extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MembershipDocument', required: true })
  declare membershipId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProjectDocument', required: true })
  declare projectId: Types.ObjectId;

  @Prop({ required: true })
  declare date: Date;

  @Prop({ required: true })
  declare hoursWorked: number;

  @Prop()
  declare costCode?: string;

  @Prop({ default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  declare status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MembershipDocument' })
  declare approvedBy?: Types.ObjectId;
}

export const TimesheetSchema = SchemaFactory.createForClass(TimesheetDocument);

TimesheetSchema.index({ membershipId: 1, date: -1 });
TimesheetSchema.index({ projectId: 1, date: -1 });
