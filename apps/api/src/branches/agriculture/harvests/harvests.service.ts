import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HarvestLogRecord } from './harvest-log.schema';
import { CreateHarvestLogDto } from './dto/create-harvest-log.dto';
import { UpdateHarvestLogDto } from './dto/update-harvest-log.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectModel(HarvestLogRecord.name)
    private harvestModel: Model<HarvestLogRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateHarvestLogDto, orgId: string): Promise<HarvestLogRecord> {
    const created = new this.harvestModel({
      ...createDto,
      organizationId: orgId,
    });
    
    const saved = await created.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'harvest_log.created', resource: 'harvest_log',
      resourceId: saved._id.toString(),
    });

    return saved;
  }

  async findAll(orgId: string, projectId: string): Promise<HarvestLogRecord[]> {
    return this.harvestModel
      .find({ organizationId: orgId, projectId, deletedAt: null })
      .sort({ harvestDate: -1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<HarvestLogRecord> {
    const record = await this.harvestModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!record) {
      throw new NotFoundException(`Harvest Log #${id} not found`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateHarvestLogDto, orgId: string): Promise<HarvestLogRecord> {
    const existing = await this.harvestModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existing) {
      throw new NotFoundException(`Harvest Log #${id} not found`);
    }

    Object.assign(existing, updateDto);
    const updated = await existing.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'harvest_log.updated', resource: 'harvest_log',
      resourceId: id, changes: updateDto,
    });

    return updated;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const record = await this.harvestModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!record) {
      throw new NotFoundException(`Harvest Log #${id} not found`);
    }
  }
}
