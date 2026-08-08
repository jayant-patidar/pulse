import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskDocument } from '../../trunk/tasks/tasks.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notifications.schema';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(TaskDocument.name) private taskModel: Model<TaskDocument>,
    private notificationsService: NotificationsService,
  ) {}

  // Run every hour to check for overdue and upcoming tasks
  @Cron(CronExpression.EVERY_HOUR)
  async handleTaskReminders() {
    this.logger.log('Running Task Reminders Cron Job...');

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // 1. Find Tasks Due Today (Upcoming)
      // They are due between now and 24 hours from now, and aren't completed.
      const dueTodayTasks = await this.taskModel.find({
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        dueDate: {
          $gt: now,
          $lte: twentyFourHoursFromNow
        }
      }).exec();

      this.logger.log(`Found ${dueTodayTasks.length} tasks due today.`);

      for (const task of dueTodayTasks) {
        // Send a reminder notification to the creator (or assignee if we had one)
        // For now, we notify the createdBy user.
        await this.notificationsService.sendNotification({
          userId: task.createdBy.toString(),
          organizationId: task.organizationId.toString(),
          title: 'Task Due Today',
          body: `Reminder: The task "${task.title}" is due in less than 24 hours.`,
          type: NotificationType.WARNING,
          link: `/projects/${task.projectId}/tasks`
        });
      }

      // 2. Find Overdue Tasks
      // They were due before now, and aren't completed.
      const overdueTasks = await this.taskModel.find({
        status: { $nin: ['COMPLETED', 'CANCELLED'] },
        dueDate: {
          $lt: now
        }
      }).exec();

      this.logger.log(`Found ${overdueTasks.length} overdue tasks.`);

      for (const task of overdueTasks) {
        await this.notificationsService.sendNotification({
          userId: task.createdBy.toString(),
          organizationId: task.organizationId.toString(),
          title: 'Task Overdue!',
          body: `Action Required: The task "${task.title}" is past its due date.`,
          type: NotificationType.URGENT,
          link: `/projects/${task.projectId}/tasks`
        });
      }

    } catch (error) {
      this.logger.error('Failed to run Task Reminders', error);
    }
  }
}
