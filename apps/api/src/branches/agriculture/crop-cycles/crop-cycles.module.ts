import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CropCycleRecord, CropCycleSchema } from './crop-cycle.schema';
import { CropCyclesController } from './crop-cycles.controller';
import { CropCyclesService } from './crop-cycles.service';

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
