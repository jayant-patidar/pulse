import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CropCyclesController } from './crop-cycles.controller';
import { CropCyclesService } from './crop-cycles.service';
import { CropCycleRecord, CropCycleSchema } from './crop-cycle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CropCycleRecord.name, schema: CropCycleSchema },
    ]),
  ],
  controllers: [CropCyclesController],
  providers: [CropCyclesService],
  exports: [CropCyclesService],
})
export class CropCyclesModule {}
