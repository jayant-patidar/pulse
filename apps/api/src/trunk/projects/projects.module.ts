import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectDocument, ProjectSchema } from './projects.schema';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectExtensionRegistry } from './projects.registry';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProjectDocument.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectExtensionRegistry],
  exports: [ProjectsService, ProjectExtensionRegistry],
})
export class ProjectsModule {}
