import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationRecord, NotificationType } from './notifications.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateNotificationDto {
  title: string;
  body: string;
  userId: string;
  organizationId: string;
  type?: NotificationType;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(NotificationRecord.name) private notificationModel: Model<NotificationRecord>,
    @InjectQueue('notifications_q') private notificationsQueue: Queue,
    private eventEmitter: EventEmitter2,
  ) {}

  async getUserNotifications(userId: string, organizationId: string) {
    return this.notificationModel
      .find({ userId, organizationId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(notificationId: string, userId: string, organizationId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId, organizationId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string, organizationId: string) {
    return this.notificationModel.updateMany(
      { userId, organizationId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async sendNotification(dto: CreateNotificationDto) {
    // 1. Save to DB
    const notification = new this.notificationModel({
      ...dto,
      type: dto.type || NotificationType.INFO,
    });
    const saved = await notification.save();

    // 2. Emit internal event for WebSocket broadcasting
    this.eventEmitter.emit('notification.created', {
      userId: dto.userId,
      organizationId: dto.organizationId,
      notification: saved,
    });

    // 3. Queue job for email/push (Debouncing & external transport)
    await this.notificationsQueue.add('send_email', {
      notificationId: saved._id,
      userId: dto.userId,
      organizationId: dto.organizationId,
      title: dto.title,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 30000,
      }
    });

    return saved;
  }
}
