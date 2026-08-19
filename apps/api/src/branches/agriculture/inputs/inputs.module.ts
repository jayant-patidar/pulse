import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InputsController } from './inputs.controller';
import { InputsService } from './inputs.service';
import { InputInventoryRecord, InputInventorySchema } from './input-inventory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InputInventoryRecord.name, schema: InputInventorySchema },
    ]),
  ],
  controllers: [InputsController],
  providers: [InputsService],
  exports: [InputsService],
})
export class InputsModule {}
