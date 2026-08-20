import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SafetyController } from './safety.controller';
import { SafetyIncidentRecord, SafetyIncidentSchema } from './safety.schema';
import { SafetyService } from './safety.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SafetyIncidentRecord.name, schema: SafetyIncidentSchema },
    ]),
  ],
  controllers: [SafetyController],
  providers: [SafetyService],
  exports: [SafetyService],
})
export class SafetyModule {}
