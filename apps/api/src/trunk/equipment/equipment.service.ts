// ============================================================
// Equipment Service — TRUNK Layer
// ============================================================
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { buildPaginatedMeta, parsePaginationQuery, type PaginationQuery } from '../../common/helpers';
import { EquipmentExtensionRegistry } from './equipment.registry';
import { EquipmentDocument } from './equipment.schema';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectModel(EquipmentDocument.name) private readonly equipmentModel: Model<EquipmentDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly registry: EquipmentExtensionRegistry,
  ) {}

  async create(orgId: string, userId: string, industry: string, dto: Record<string, unknown>) {
    if (dto.extensions) {
      const plugin = this.registry.getPlugin(industry);
      if (plugin) {
        dto.extensions = await plugin.validateExtensions(dto.extensions);
      }
    }

    const equipment = await this.equipmentModel.create({
      ...dto,
      organizationId: orgId,
      createdBy: userId,
      industry,
      status: 'AVAILABLE',
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'equipment.created', resource: 'equipment',
      resourceId: equipment._id.toString(),
    });

    return equipment;
  }

  async findAll(orgId: string, query: PaginationQuery): Promise<any> {
    const { skip, limit, sort, filter, page } = parsePaginationQuery(query);

    const mongoFilter: Record<string, unknown> = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (filter.status) mongoFilter.status = filter.status;
    if (filter.currentProjectId) mongoFilter.currentProjectId = filter.currentProjectId;

    const [docs, total] = await Promise.all([
      this.equipmentModel.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      this.equipmentModel.countDocuments(mongoFilter),
    ]);

    return { docs, meta: buildPaginatedMeta(total, page, limit) };
  }

  async findById(orgId: string, id: string): Promise<any> {
    const equipment = await this.equipmentModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  async update(orgId: string, userId: string, id: string, dto: Record<string, unknown>) {
    if (dto.extensions) {
      const existing = await this.equipmentModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
      if (existing) {
        const industry = (existing as any).industry || 'CONSTRUCTION';
        const plugin = this.registry.getPlugin(industry);
        if (plugin) {
          dto.extensions = await plugin.validateExtensions(dto.extensions);
        }
      }
    }

    const equipment = await this.equipmentModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!equipment) throw new NotFoundException('Equipment not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'equipment.updated', resource: 'equipment',
      resourceId: id, changes: dto,
    });

    return equipment;
  }

  async assignToProject(orgId: string, userId: string, id: string, projectId: string) {
    const equipment = await this.equipmentModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: { currentProjectId: projectId, status: 'IN_USE' } },
      { new: true },
    );
    if (!equipment) throw new NotFoundException('Equipment not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'equipment.assigned', resource: 'equipment',
      resourceId: id, changes: { projectId },
    });

    return equipment;
  }

  async softDelete(orgId: string, userId: string, id: string) {
    const equipment = await this.equipmentModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!equipment) throw new NotFoundException('Equipment not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'equipment.deleted', resource: 'equipment', resourceId: id,
    });

    return { success: true };
  }
}
