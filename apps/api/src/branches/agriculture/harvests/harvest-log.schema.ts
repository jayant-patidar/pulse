import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'agr_harvest_logs' })
export class HarvestLogRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project', index: true })
  declare projectId: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'CropCycleRecord', index: true })
  declare cropCycleId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  declare harvestDate: Date;

  @Prop({ required: false })
  declare fieldZone?: string;

  @Prop({ required: true })
  declare acresHarvested: number;

  @Prop({ required: false })
  declare yieldBushelsPerAcre?: number;

  @Prop({ required: false })
  declare moisturePercent?: number;

  @Prop({ required: false })
  declare grainQualityGrade?: string;

  @Prop({ required: false })
  declare storageLocation?: string;

  @Prop({ required: false })
  declare notes?: string;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const HarvestLogSchema = SchemaFactory.createForClass(HarvestLogRecord);
