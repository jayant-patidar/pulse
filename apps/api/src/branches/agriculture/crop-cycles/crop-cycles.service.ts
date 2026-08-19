import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CropCycleRecord, CropCycleStatus } from './crop-cycle.schema';
import { CreateCropCycleDto } from './dto/create-crop-cycle.dto';
import { UpdateCropCycleDto } from './dto/update-crop-cycle.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

const STATUS_TRANSITIONS: Record<CropCycleStatus, CropCycleStatus[]> = {
  [CropCycleStatus.PLANNED]: [CropCycleStatus.PLANTED, CropCycleStatus.ABANDONED],
  [CropCycleStatus.PLANTED]: [CropCycleStatus.GROWING, CropCycleStatus.ABANDONED],
  [CropCycleStatus.GROWING]: [CropCycleStatus.HARVESTING, CropCycleStatus.ABANDONED],
  [CropCycleStatus.HARVESTING]: [CropCycleStatus.COMPLETED, CropCycleStatus.ABANDONED],
  [CropCycleStatus.COMPLETED]: [],
  [CropCycleStatus.ABANDONED]: [],
};

@Injectable()
export class CropCyclesService {
  constructor(
    @InjectModel(CropCycleRecord.name)
    private cropCycleModel: Model<CropCycleRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateCropCycleDto, orgId: string): Promise<CropCycleRecord> {
    const created = new this.cropCycleModel({
      ...createDto,
      organizationId: orgId,
      status: createDto.status || CropCycleStatus.PLANNED,
    });
    
    const saved = await created.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'crop_cycle.created', resource: 'crop_cycle',
      resourceId: saved._id.toString(),
    });

    return saved;
  }

  async findAll(orgId: string, projectId: string): Promise<CropCycleRecord[]> {
    return this.cropCycleModel
      .find({ organizationId: orgId, projectId, deletedAt: null })
      .sort({ plantingDate: -1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<CropCycleRecord> {
    const record = await this.cropCycleModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!record) {
      throw new NotFoundException(`Crop Cycle #${id} not found`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateCropCycleDto, orgId: string): Promise<CropCycleRecord> {
    const existing = await this.cropCycleModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existing) {
      throw new NotFoundException(`Crop Cycle #${id} not found`);
    }

    if (updateDto.status && updateDto.status !== existing.status) {
      const allowed = STATUS_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(updateDto.status)) {
        throw new Error(`Cannot transition Crop Cycle from ${existing.status} to ${updateDto.status}.`);
      }
    }

    Object.assign(existing, updateDto);
    const updated = await existing.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'crop_cycle.updated', resource: 'crop_cycle',
      resourceId: id, changes: updateDto,
    });

    return updated;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const record = await this.cropCycleModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!record) {
      throw new NotFoundException(`Crop Cycle #${id} not found`);
    }
  }
}
