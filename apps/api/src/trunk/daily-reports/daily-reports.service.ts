// ============================================================
// Daily Reports Service — TRUNK Layer
// ============================================================
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DailyReportDocument } from './daily-reports.schema';
import { parsePaginationQuery, buildPaginatedMeta, type PaginationQuery } from '../../common/helpers';
import { ReportExtensionRegistry } from './daily-reports.registry';

@Injectable()
export class DailyReportsService {
  private readonly logger = new Logger(DailyReportsService.name);

  constructor(
    @InjectModel(DailyReportDocument.name) private readonly reportModel: Model<DailyReportDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly registry: ReportExtensionRegistry,
  ) {}

  async create(orgId: string, userId: string, industry: string, dto: Record<string, unknown>) {
    if (dto.extensions) {
      const plugin = this.registry.getPlugin(industry);
      if (plugin) {
        dto.extensions = await plugin.validateExtensions(dto.extensions);
      }
    }

    const report = await this.reportModel.create({
      ...dto,
      organizationId: orgId,
      createdBy: userId,
      industry,
      status: 'DRAFT',
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'daily_report.created', resource: 'daily_report',
      resourceId: report._id.toString(),
    });

    return report;
  }

  async findAll(orgId: string, query: PaginationQuery) {
    const { skip, limit, sort, filter, page } = parsePaginationQuery(query);

    const mongoFilter: Record<string, unknown> = {
      organizationId: orgId,
      deletedAt: null,
    };

    if (filter.status) mongoFilter.status = filter.status;
    if (filter.projectId) mongoFilter.projectId = filter.projectId;

    const [docs, total] = await Promise.all([
      this.reportModel.find(mongoFilter).sort(sort).skip(skip).limit(limit).lean(),
      this.reportModel.countDocuments(mongoFilter),
    ]);

    return { docs, meta: buildPaginatedMeta(total, page, limit) };
  }

  async findById(orgId: string, id: string) {
    const report = await this.reportModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
    if (!report) throw new NotFoundException('Daily report not found');
    return report;
  }

  async update(orgId: string, userId: string, id: string, dto: Record<string, unknown>) {
    // Only DRAFT reports can be edited
    const existing = await this.reportModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).lean();
    if (!existing) throw new NotFoundException('Daily report not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(`Cannot edit a report with status: ${existing.status}. Only DRAFT reports can be modified.`);
    }

    if (dto.extensions) {
      const industry = (existing as any).industry || 'CONSTRUCTION';
      const plugin = this.registry.getPlugin(industry);
      if (plugin) {
        dto.extensions = await plugin.validateExtensions(dto.extensions);
      }
    }

    const report = await this.reportModel.findOneAndUpdate(
      { _id: id, organizationId: orgId, deletedAt: null },
      { $set: dto },
      { new: true, runValidators: true },
    );

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'daily_report.updated', resource: 'daily_report',
      resourceId: id, changes: dto,
    });

    return report;
  }

  async submit(orgId: string, userId: string, id: string) {
    const report = await this.reportModel.findOne({ _id: id, organizationId: orgId, deletedAt: null });
    if (!report) throw new NotFoundException('Daily report not found');
    if (report.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT reports can be submitted');
    }

    report.status = 'SUBMITTED';
    await report.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'daily_report.submitted', resource: 'daily_report',
      resourceId: id,
    });

    return report;
  }

  async approve(orgId: string, userId: string, id: string) {
    const report = await this.reportModel.findOne({ _id: id, organizationId: orgId, deletedAt: null });
    if (!report) throw new NotFoundException('Daily report not found');
    if (report.status !== 'SUBMITTED' && report.status !== 'UNDER_REVIEW') {
      throw new BadRequestException(`Cannot approve a report with status: ${report.status}`);
    }

    report.status = 'APPROVED';
    report.approvedBy = userId as any;
    await report.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'daily_report.approved', resource: 'daily_report',
      resourceId: id,
    });

    return report;
  }

  async softDelete(orgId: string, userId: string, id: string) {
    const existing = await this.reportModel.findOne({ _id: id, organizationId: orgId, deletedAt: null });
    if (!existing) throw new NotFoundException('Daily report not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT reports can be deleted');
    }

    existing.deletedAt = new Date();
    await existing.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'daily_report.deleted', resource: 'daily_report', resourceId: id,
    });

    return { success: true };
  }
}
