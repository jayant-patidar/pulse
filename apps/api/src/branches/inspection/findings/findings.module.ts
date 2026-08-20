import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FindingRecord, FindingSchema } from './finding.schema';
import { FindingsController } from './findings.controller';
import { FindingsService } from './findings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FindingRecord.name, schema: FindingSchema },
    ]),
  ],
  controllers: [FindingsController],
  providers: [FindingsService],
  exports: [FindingsService],
})
export class FindingsModule {}
