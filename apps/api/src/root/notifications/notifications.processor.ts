import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notifications_q')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  @Process('send_email')
  async handleSendEmail(job: Job) {
    this.logger.debug(`[MOCK] Sending email for notification ${job.data.notificationId} to user ${job.data.userId}`);
    this.logger.debug(`Title: ${job.data.title}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.logger.debug(`[MOCK] Email sent successfully.`);
    return {};
  }
}
