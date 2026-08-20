import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InputInventoryRecord, InputInventorySchema } from './input-inventory.schema';
import { InputsController } from './inputs.controller';
import { InputsService } from './inputs.service';

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
