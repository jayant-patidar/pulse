import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SafetyIncidentRecord, IncidentStatus } from './safety.schema';
import { CreateSafetyIncidentDto } from './dto/create-safety-incident.dto';
import { UpdateSafetyIncidentDto } from './dto/update-safety-incident.dto';

@Injectable()
export class SafetyService {
  constructor(
    @InjectModel(SafetyIncidentRecord.name)
    private safetyModel: Model<SafetyIncidentRecord>,
  ) {}

  async create(createDto: CreateSafetyIncidentDto, orgId: string): Promise<SafetyIncidentRecord> {
    const createdIncident = new this.safetyModel({
      ...createDto,
      organizationId: orgId,
      status: createDto.status || IncidentStatus.OPEN,
    });
    return createdIncident.save();
  }

  async findAll(orgId: string): Promise<SafetyIncidentRecord[]> {
    return this.safetyModel
      .find({ organizationId: orgId, deletedAt: null })
      .sort({ dateOccurred: -1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<SafetyIncidentRecord> {
    const incident = await this.safetyModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!incident) {
      throw new NotFoundException(`Safety incident #${id} not found`);
    }
    return incident;
  }

  async update(id: string, updateDto: UpdateSafetyIncidentDto, orgId: string): Promise<SafetyIncidentRecord> {
    const existingIncident = await this.safetyModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: updateDto },
        { new: true },
      )
      .exec();

    if (!existingIncident) {
      throw new NotFoundException(`Safety incident #${id} not found`);
    }
    return existingIncident;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const incident = await this.safetyModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!incident) {
      throw new NotFoundException(`Safety incident #${id} not found`);
    }
  }
}
