import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

import { DocumentRecord, DocumentSchema } from '../../trunk/documents/documents.schema';
import { EquipmentDocument, EquipmentSchema } from '../../trunk/equipment/equipment.schema';
import { ProjectDocument, ProjectSchema } from '../../trunk/projects/projects.schema';
import { TaskDocument, TaskSchema } from '../../trunk/tasks/tasks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectDocument.name, schema: ProjectSchema },
      { name: TaskDocument.name, schema: TaskSchema },
      { name: DocumentRecord.name, schema: DocumentSchema },
      { name: EquipmentDocument.name, schema: EquipmentSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
