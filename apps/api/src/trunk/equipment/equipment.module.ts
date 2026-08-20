import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentController } from './equipment.controller';
import { EquipmentExtensionRegistry } from './equipment.registry';
import { EquipmentDocument, EquipmentSchema } from './equipment.schema';
import { EquipmentService } from './equipment.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EquipmentDocument.name, schema: EquipmentSchema }]),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService, EquipmentExtensionRegistry],
  exports: [EquipmentService, EquipmentExtensionRegistry],
})
export class EquipmentModule {}
