import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InspectionRecord } from './inspection.schema';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectModel(InspectionRecord.name) private readonly inspectionModel: Model<InspectionRecord>,
  ) {}

  async create(organizationId: string, createDto: CreateInspectionDto): Promise<InspectionRecord> {
    const created = new this.inspectionModel({
      ...createDto,
      organizationId,
    });
    return created.save();
  }

  async findAll(organizationId: string, projectId?: string): Promise<InspectionRecord[]> {
    const filter: any = { organizationId, deletedAt: { $exists: false } };
    if (projectId) filter.projectId = projectId;
    return this.inspectionModel.find(filter).sort({ scheduledDate: -1 }).exec();
  }

  async findOne(organizationId: string, id: string): Promise<InspectionRecord> {
    const record = await this.inspectionModel.findOne({
      _id: id,
      organizationId,
      deletedAt: { $exists: false },
    }).exec();
    if (!record) throw new NotFoundException('Inspection not found');
    return record;
  }

  async update(organizationId: string, id: string, updateDto: UpdateInspectionDto): Promise<InspectionRecord> {
    const updated = await this.inspectionModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: updateDto },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Inspection not found');
    return updated;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const record = await this.inspectionModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
    ).exec();
    if (!record) throw new NotFoundException('Inspection not found');
  }
}
