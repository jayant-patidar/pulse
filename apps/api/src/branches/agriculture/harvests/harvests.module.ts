import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';
import { HarvestLogRecord, HarvestLogSchema } from './harvest-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HarvestLogRecord.name, schema: HarvestLogSchema },
    ]),
  ],
  controllers: [HarvestsController],
  providers: [HarvestsService],
  exports: [HarvestsService],
})
export class HarvestsModule {}
