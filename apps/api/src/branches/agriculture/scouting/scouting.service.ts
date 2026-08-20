import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScoutingReportDto } from './dto/create-scouting-report.dto';
import { UpdateScoutingReportDto } from './dto/update-scouting-report.dto';
import { ScoutingReportRecord, ScoutingSeverity, ScoutingStatus } from './scouting-report.schema';

@Injectable()
export class ScoutingService {
  constructor(
    @InjectModel(ScoutingReportRecord.name)
    private scoutingModel: Model<ScoutingReportRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateScoutingReportDto, orgId: string): Promise<ScoutingReportRecord> {
    const created = new this.scoutingModel({
      ...createDto,
      organizationId: orgId,
      status: createDto.status || ScoutingStatus.OPEN,
    });
    
    const saved = await created.save();

    if (saved.severity === ScoutingSeverity.CRITICAL) {
      this.eventEmitter.emit('notification.send', {
        organizationId: orgId,
        userId: 'admin',
        title: `CRITICAL SCOUTING ALERT: ${saved.observationType}`,
        body: `A critical ${saved.observationType} was found on ${saved.scoutDate.toDateString()}. Immediate action required.`,
        type: 'URGENT',
        link: `/projects/${saved.projectId}/scouting/${saved._id}`,
      });
    }

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'scouting_report.created', resource: 'scouting_report',
      resourceId: saved._id.toString(),
    });

    return saved;
  }

  async findAll(orgId: string, projectId: string): Promise<ScoutingReportRecord[]> {
    return this.scoutingModel
      .find({ organizationId: orgId, projectId, deletedAt: null })
      .sort({ scoutDate: -1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<ScoutingReportRecord> {
    const record = await this.scoutingModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!record) {
      throw new NotFoundException(`Scouting Report #${id} not found`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateScoutingReportDto, orgId: string): Promise<ScoutingReportRecord> {
    const existing = await this.scoutingModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existing) {
      throw new NotFoundException(`Scouting Report #${id} not found`);
    }

    Object.assign(existing, updateDto);
    const updated = await existing.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'scouting_report.updated', resource: 'scouting_report',
      resourceId: id, changes: updateDto,
    });

    return updated;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const record = await this.scoutingModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!record) {
      throw new NotFoundException(`Scouting Report #${id} not found`);
    }
  }
}
