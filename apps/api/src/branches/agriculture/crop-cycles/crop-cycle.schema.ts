import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CropCycleStatus {
  PLANNED = 'PLANNED',
  PLANTED = 'PLANTED',
  GROWING = 'GROWING',
  HARVESTING = 'HARVESTING',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Schema({ timestamps: true, collection: 'agr_crop_cycles' })
export class CropCycleRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  declare fieldName: string;

  @Prop({ required: true })
  declare cropType: string;

  @Prop({ required: false })
  declare variety?: string;

  @Prop({ required: true })
  declare plantingDate: Date;

  @Prop({ required: false })
  declare expectedHarvestDate?: Date;

  @Prop({ required: false })
  declare acreage?: number;

  @Prop({ required: false })
  declare seedRatePerAcre?: number;

  @Prop({ required: false })
  declare rowSpacingInches?: number;

  @Prop({ required: true, enum: CropCycleStatus, default: CropCycleStatus.PLANNED })
  declare status: CropCycleStatus;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const CropCycleSchema = SchemaFactory.createForClass(CropCycleRecord);
