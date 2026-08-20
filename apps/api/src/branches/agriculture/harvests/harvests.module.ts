import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HarvestLogRecord, HarvestLogSchema } from './harvest-log.schema';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';

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
