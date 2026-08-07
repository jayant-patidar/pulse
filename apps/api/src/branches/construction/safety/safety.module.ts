import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { SafetyIncidentRecord, SafetyIncidentSchema } from './safety.schema';

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
