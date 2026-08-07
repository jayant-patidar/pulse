import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChangeOrdersController } from './change-orders.controller';
import { ChangeOrdersService } from './change-orders.service';
import { ChangeOrderRecord, ChangeOrderSchema } from './change-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChangeOrderRecord.name, schema: ChangeOrderSchema },
    ]),
  ],
  controllers: [ChangeOrdersController],
  providers: [ChangeOrdersService],
  exports: [ChangeOrdersService],
})
export class ChangeOrdersModule {}
