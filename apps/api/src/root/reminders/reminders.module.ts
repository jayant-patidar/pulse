import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemindersService } from './reminders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TaskDocument, TaskSchema } from '../../trunk/tasks/tasks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskDocument.name, schema: TaskSchema }]),
    NotificationsModule
  ],
  providers: [RemindersService],
})
export class RemindersModule {}
