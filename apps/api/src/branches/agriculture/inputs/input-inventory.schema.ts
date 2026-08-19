import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum InputType {
  SEED = 'SEED',
  FERTILIZER = 'FERTILIZER',
  HERBICIDE = 'HERBICIDE',
  INSECTICIDE = 'INSECTICIDE',
  FUNGICIDE = 'FUNGICIDE',
  FUEL = 'FUEL',
  OTHER = 'OTHER',
}

export enum InputStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Schema({ timestamps: true, collection: 'agr_input_inventory' })
export class InputInventoryRecord extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Organization', index: true })
  declare organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: InputType })
  declare inputType: InputType;

  @Prop({ required: true })
  declare productName: string;

  @Prop({ required: false })
  declare manufacturer?: string;

  @Prop({ required: true })
  declare quantityOnHand: number;

  @Prop({ required: true })
  declare unit: string;

  @Prop({ required: false })
  declare costPerUnitCents?: number;

  @Prop({ required: false })
  declare expirationDate?: Date;

  @Prop({ required: false })
  declare epaRegistrationNumber?: string;

  @Prop({ required: true, enum: InputStatus, default: InputStatus.IN_STOCK })
  declare status: InputStatus;

  @Prop({ required: false })
  declare notes?: string;

  @Prop({ required: false })
  declare deletedAt?: Date;
}

export const InputInventorySchema = SchemaFactory.createForClass(InputInventoryRecord);
