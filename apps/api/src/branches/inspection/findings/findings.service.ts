import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindingRecord } from './finding.schema';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';

@Injectable()
export class FindingsService {
  constructor(
    @InjectModel(FindingRecord.name) private readonly findingModel: Model<FindingRecord>,
  ) {}

  async create(organizationId: string, createDto: CreateFindingDto): Promise<FindingRecord> {
    const created = new this.findingModel({
      ...createDto,
      organizationId,
    });
    return created.save();
  }

  async findAll(organizationId: string, inspectionId?: string, projectId?: string): Promise<FindingRecord[]> {
    const filter: any = { organizationId, deletedAt: { $exists: false } };
    if (inspectionId) filter.inspectionId = inspectionId;
    if (projectId) filter.projectId = projectId;
    return this.findingModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(organizationId: string, id: string): Promise<FindingRecord> {
    const record = await this.findingModel.findOne({
      _id: id,
      organizationId,
      deletedAt: { $exists: false },
    }).exec();
    if (!record) throw new NotFoundException('Finding not found');
    return record;
  }

  async update(organizationId: string, id: string, updateDto: UpdateFindingDto): Promise<FindingRecord> {
    const updated = await this.findingModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: updateDto },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Finding not found');
    return updated;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const record = await this.findingModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
    ).exec();
    if (!record) throw new NotFoundException('Finding not found');
  }
}
