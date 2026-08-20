import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScoutingReportRecord, ScoutingReportSchema } from './scouting-report.schema';
import { ScoutingController } from './scouting.controller';
import { ScoutingService } from './scouting.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScoutingReportRecord.name, schema: ScoutingReportSchema },
    ]),
  ],
  controllers: [ScoutingController],
  providers: [ScoutingService],
  exports: [ScoutingService],
})
export class ScoutingModule {}
