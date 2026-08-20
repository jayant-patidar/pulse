import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CorrectiveActionRecord } from './corrective-action.schema';
import { CreateCorrectiveActionDto } from './dto/create-corrective-action.dto';
import { UpdateCorrectiveActionDto } from './dto/update-corrective-action.dto';

@Injectable()
export class CorrectiveActionsService {
  constructor(
    @InjectModel(CorrectiveActionRecord.name) private readonly correctiveActionModel: Model<CorrectiveActionRecord>,
  ) {}

  async create(organizationId: string, createDto: CreateCorrectiveActionDto): Promise<CorrectiveActionRecord> {
    const created = new this.correctiveActionModel({
      ...createDto,
      organizationId,
    });
    return created.save();
  }

  async findAll(organizationId: string, projectId?: string, findingId?: string): Promise<CorrectiveActionRecord[]> {
    const filter: any = { organizationId, deletedAt: { $exists: false } };
    if (projectId) filter.projectId = projectId;
    if (findingId) filter.findingId = findingId;
    return this.correctiveActionModel.find(filter).sort({ deadline: 1 }).exec();
  }

  async findOne(organizationId: string, id: string): Promise<CorrectiveActionRecord> {
    const record = await this.correctiveActionModel.findOne({
      _id: id,
      organizationId,
      deletedAt: { $exists: false },
    }).exec();
    if (!record) throw new NotFoundException('Corrective action not found');
    return record;
  }

  async update(organizationId: string, id: string, updateDto: UpdateCorrectiveActionDto): Promise<CorrectiveActionRecord> {
    const updated = await this.correctiveActionModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: updateDto },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Corrective action not found');
    return updated;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const record = await this.correctiveActionModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
    ).exec();
    if (!record) throw new NotFoundException('Corrective action not found');
  }
}
