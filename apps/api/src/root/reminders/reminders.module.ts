import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskDocument, TaskSchema } from '../../trunk/tasks/tasks.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { RemindersService } from './reminders.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskDocument.name, schema: TaskSchema }]),
    NotificationsModule
  ],
  providers: [RemindersService],
})
export class RemindersModule {}
