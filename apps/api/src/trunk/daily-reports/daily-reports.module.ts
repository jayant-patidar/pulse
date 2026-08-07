import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyReportDocument, DailyReportSchema } from './daily-reports.schema';
import { DailyReportsService } from './daily-reports.service';
import { DailyReportsController } from './daily-reports.controller';
import { ReportExtensionRegistry } from './daily-reports.registry';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DailyReportDocument.name, schema: DailyReportSchema }]),
  ],
  controllers: [DailyReportsController],
  providers: [DailyReportsService, ReportExtensionRegistry],
  exports: [DailyReportsService, ReportExtensionRegistry],
})
export class DailyReportsModule {}
