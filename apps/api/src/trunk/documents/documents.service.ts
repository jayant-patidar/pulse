// ============================================================
// Documents Service — TRUNK Layer
// ============================================================
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentRecord } from './documents.schema';
import { parsePaginationQuery, buildPaginatedMeta, type PaginationQuery } from '../../common/helpers';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(DocumentRecord.name) private readonly documentModel: Model<DocumentRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(orgId: string, userId: string, industry: string, dto: Record<string, unknown>) {
    // Generate a placeholder s3Key (real S3 integration comes later)
    const s3Key = `orgs/${orgId}/documents/${randomUUID()}/${dto.originalFilename || 'file'}`;

    const doc = await this.documentModel.create({
      ...dto,
      organizationId: orgId,
      createdBy: userId,
      industry,
      s3Key,
      version: 1,
      isLatest: true,
      approvalStatus: 'NONE',
      aiStatus: 'PENDING',
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'document.created', resource: 'document',
      resourceId: doc._id.toString(),
    });

    return doc;
  }

  async findAll(orgId: string, query: PaginationQuery) {
    const { skip, limit, sort, filter, page } = parsePaginationQuery(query);

    const mongoFilter: Record<string, unknown> = {
      organizationId: orgId,
      deletedAt: null,
      isLatest: true,
    };

    if (filter.projectId) mongoFilter.projectId = filter.projectId;
    if (filter.folderId) mongoFilter.folderId = filter.folderId;
    if (filter.approvalStatus) mongoFilter.approvalStatus = filter.approvalStatus;

    const [docs, total] = await Promise.all([
      this.documentModel.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      this.documentModel.countDocuments(mongoFilter),
    ]);

    return { docs, meta: buildPaginatedMeta(total, page, limit) };
  }

  async findById(orgId: string, id: string) {
    const doc = await this.documentModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(orgId: string, userId: string, id: string, dto: Record<string, unknown>) {
    const doc = await this.documentModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!doc) throw new NotFoundException('Document not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'document.updated', resource: 'document',
      resourceId: id, changes: dto,
    });

    return doc;
  }

  async approve(orgId: string, userId: string, id: string) {
    const doc = await this.documentModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: { approvalStatus: 'APPROVED', approvedBy: userId } },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'document.approved', resource: 'document', resourceId: id,
    });

    return doc;
  }

  async softDelete(orgId: string, userId: string, id: string) {
    const doc = await this.documentModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'document.deleted', resource: 'document', resourceId: id,
    });

    return { success: true };
  }
}
