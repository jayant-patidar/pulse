// ============================================================
// Tasks Service — TRUNK Layer
// ============================================================
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { buildPaginatedMeta, parsePaginationQuery, type PaginationQuery } from '../../common/helpers';
import { TaskExtensionRegistry } from './tasks.registry';
import { TaskDocument } from './tasks.schema';

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
    private readonly registry: TaskExtensionRegistry,
  ) {}

  async create(orgId: string, userId: string, defaultIndustry: string, dto: Record<string, unknown>) {
    let industry = defaultIndustry;
    if (dto.projectId) {
      try {
        const project = await this.taskModel.db.collection('projects').findOne({ _id: new Types.ObjectId(dto.projectId as string) });
        if (project && project.industry) {
          industry = project.industry as string;
        }
      } catch (e) {
        // Ignore invalid object id
      }
    }

    if (dto.extensions) {
      const plugin = this.registry.getPlugin(industry);
      if (plugin) {
        dto.extensions = await plugin.validateExtensions(dto.extensions);
      }
    }

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
    const current = await this.taskModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
    if (!current) throw new NotFoundException('Task not found');

    // Validate status transition if status is being changed
    if (dto.status && dto.status !== current.status) {
      const allowed = STATUS_TRANSITIONS[current.status] || [];
      if (!allowed.includes(dto.status as string)) {
        throw new BadRequestException(
          `Cannot transition from ${current.status} to ${dto.status}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
        );
      }

      // Dependency Checking: Cannot complete if dependencies are not completed
      if (dto.status === 'COMPLETED' && current.dependencies && current.dependencies.length > 0) {
        const blockingTasks = await this.taskModel.find({
          _id: { $in: current.dependencies },
          organizationId: orgId,
          status: { $nin: ['COMPLETED', 'CANCELLED'] },
        }).lean();
        
        if (blockingTasks.length > 0) {
          const blockingIds = blockingTasks.map(t => t._id.toString());
          throw new BadRequestException(`Cannot complete task. Waiting on dependencies: ${blockingIds.join(', ')}`);
        }
      }

      // Auto-set dates on status transitions
      if (dto.status === 'IN_PROGRESS' && !current.actualStartDate) {
        dto.actualStartDate = new Date();
      }
      if (dto.status === 'COMPLETED') {
        dto.actualEndDate = new Date();
      }
    }

    // Validate extensions if updating
    if (dto.extensions) {
      const industry = (current as any).industry || 'CONSTRUCTION';
      const plugin = this.registry.getPlugin(industry);
      if (plugin) {
        dto.extensions = await plugin.validateExtensions(dto.extensions);
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
