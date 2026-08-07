import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoiController } from './coi.controller';
import { CoiService } from './coi.service';
import { CoiRecord, CoiSchema } from './coi.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoiRecord.name, schema: CoiSchema },
    ]),
  ],
  controllers: [CoiController],
  providers: [CoiService],
  exports: [CoiService],
})
export class CoiModule {}
