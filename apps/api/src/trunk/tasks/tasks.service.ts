// ============================================================
// Tasks Service — TRUNK Layer
// ============================================================
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskDocument } from './tasks.schema';
import { parsePaginationQuery, buildPaginatedMeta, type PaginationQuery } from '../../common/helpers';

// Valid status transitions (state machine)
const STATUS_TRANSITIONS: Record<string, string[]> = {
  TODO:        ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['BLOCKED', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
  BLOCKED:     ['IN_PROGRESS', 'CANCELLED'],
  ON_HOLD:     ['TODO', 'IN_PROGRESS', 'CANCELLED'],
  COMPLETED:   [], // Terminal state
  CANCELLED:   [], // Terminal state
};

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(TaskDocument.name) private readonly taskModel: Model<TaskDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(orgId: string, userId: string, industry: string, dto: Record<string, unknown>) {
    const task = await this.taskModel.create({
      ...dto,
      organizationId: orgId,
      createdBy: userId,
      industry,
      status: 'TODO',
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'task.created', resource: 'task',
      resourceId: task._id.toString(),
    });

    return task;
  }

  async findAll(orgId: string, query: PaginationQuery) {
    const { skip, limit, sort, filter, page } = parsePaginationQuery(query);

    const mongoFilter: Record<string, unknown> = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (filter.status) mongoFilter.status = filter.status;
    if (filter.priority) mongoFilter.priority = filter.priority;
    if (filter.projectId) mongoFilter.projectId = filter.projectId;
    if (filter.assigneeIds) mongoFilter.assigneeIds = filter.assigneeIds;

    const [docs, total] = await Promise.all([
      this.taskModel.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      this.taskModel.countDocuments(mongoFilter),
    ]);

    return { docs, meta: buildPaginatedMeta(total, page, limit) };
  }

  async findById(orgId: string, id: string) {
    const task = await this.taskModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(orgId: string, userId: string, id: string, dto: Record<string, unknown>) {
    // Validate status transition if status is being changed
    if (dto.status) {
      const current = await this.taskModel.findOne({ _id: id, organizationId: orgId, deletedAt: null });
      if (!current) throw new NotFoundException('Task not found');

      const allowed = STATUS_TRANSITIONS[current.status] || [];
      if (!allowed.includes(dto.status as string)) {
        throw new BadRequestException(
          `Cannot transition from ${current.status} to ${dto.status}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
        );
      }

      // Auto-set dates on status transitions
      if (dto.status === 'IN_PROGRESS' && !current.actualStartDate) {
        dto.actualStartDate = new Date();
      }
      if (dto.status === 'COMPLETED') {
        dto.actualEndDate = new Date();
      }
    }

    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: dto },
      { new: true, runValidators: true },
    );

    if (!task) throw new NotFoundException('Task not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'task.updated', resource: 'task',
      resourceId: id, changes: dto,
    });

    return task;
  }

  async softDelete(orgId: string, userId: string, id: string) {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!task) throw new NotFoundException('Task not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'task.deleted', resource: 'task', resourceId: id,
    });

    return { success: true };
  }
}
