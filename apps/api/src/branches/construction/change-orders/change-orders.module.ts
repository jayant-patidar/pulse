import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChangeOrderRecord, ChangeOrderSchema } from './change-order.schema';
import { ChangeOrdersController } from './change-orders.controller';
import { ChangeOrdersService } from './change-orders.service';

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
