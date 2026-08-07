// ============================================================
// Projects Service — TRUNK Layer
// ============================================================
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectDocument } from './projects.schema';
import { parsePaginationQuery, buildPaginatedMeta, type PaginationQuery } from '../../common/helpers';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel(ProjectDocument.name) private readonly projectModel: Model<ProjectDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(orgId: string, userId: string, industry: string, dto: Record<string, unknown>) {
    const project = await this.projectModel.create({
      ...dto,
      organizationId: orgId,
      createdBy: userId,
      industry,
      status: 'DRAFT',
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId,
      action: 'project.created',
      resource: 'project',
      resourceId: project._id.toString(),
    });

    return project;
  }

  async findAll(orgId: string, query: PaginationQuery) {
    const { skip, limit, sort, filter, page } = parsePaginationQuery(query);

    const mongoFilter: Record<string, unknown> = {
      organizationId: orgId,
      deletedAt: null,
    };

    // Apply allowed filters
    if (filter.status) mongoFilter.status = filter.status;
    if (filter.managerIds) mongoFilter.managerIds = filter.managerIds;

    const [docs, total] = await Promise.all([
      this.projectModel.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      this.projectModel.countDocuments(mongoFilter),
    ]);

    return { docs, meta: buildPaginatedMeta(total, page, limit) };
  }

  async findById(orgId: string, id: string) {
    const project = await this.projectModel.findOne({
      _id: id,
      organizationId: orgId,
      deletedAt: null,
    }).lean();

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(orgId: string, userId: string, id: string, dto: Record<string, unknown>) {
    const project = await this.projectModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: dto },
      { new: true, runValidators: true },
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId,
      action: 'project.updated',
      resource: 'project',
      resourceId: id,
      changes: dto,
    });

    return project;
  }

  async softDelete(orgId: string, userId: string, id: string) {
    const project = await this.projectModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId,
      action: 'project.deleted',
      resource: 'project',
      resourceId: id,
    });

    return { success: true };
  }
}
