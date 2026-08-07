import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyReportDocument, DailyReportSchema } from './daily-reports.schema';
import { DailyReportsService } from './daily-reports.service';
import { DailyReportsController } from './daily-reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DailyReportDocument.name, schema: DailyReportSchema }]),
  ],
  controllers: [DailyReportsController],
  providers: [DailyReportsService],
  exports: [DailyReportsService],
})
export class DailyReportsModule {}
