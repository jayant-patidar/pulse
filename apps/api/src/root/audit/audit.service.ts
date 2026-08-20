import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLogDocument } from './audit.schema';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLogDocument.name) private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Direct logging method — can be called explicitly from any service.
   */
  async log(entry: {
    organizationId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await this.auditModel.create(entry);
    } catch (error) {
      // Audit logging must never crash the main request
      this.logger.error('Failed to write audit log', error);
    }
  }

  /**
   * Event-driven audit handler.
   * Any service can emit 'audit.log' events and they will be captured here.
   * This decouples the audit system from the business logic.
   */
  @OnEvent('audit.log', { async: true })
  async handleAuditEvent(payload: {
    organizationId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await this.auditModel.create(payload);
      this.logger.debug(`Audit: ${payload.action} on ${payload.resource} by ${payload.userId || 'system'}`);
    } catch (error) {
      this.logger.error(`Failed to write audit event: ${payload.action}`, error);
    }
  }
}
