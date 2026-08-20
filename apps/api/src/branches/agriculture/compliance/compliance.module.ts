import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgrComplianceRecord, AgrComplianceSchema } from './agr-compliance.schema';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AgrComplianceRecord.name, schema: AgrComplianceSchema },
    ]),
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
