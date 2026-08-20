import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TaskExtensionRegistry } from './tasks.registry';
import { TaskDocument, TaskSchema } from './tasks.schema';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskDocument.name, schema: TaskSchema }]),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskExtensionRegistry],
  exports: [TasksService, TaskExtensionRegistry],
})
export class TasksModule {}
