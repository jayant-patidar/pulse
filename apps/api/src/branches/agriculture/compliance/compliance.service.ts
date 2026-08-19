import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgrComplianceRecord, ComplianceStatus } from './agr-compliance.schema';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { UpdateComplianceDto } from './dto/update-compliance.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectModel(AgrComplianceRecord.name)
    private complianceModel: Model<AgrComplianceRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateComplianceDto, orgId: string): Promise<AgrComplianceRecord> {
    const created = new this.complianceModel({
      ...createDto,
      organizationId: orgId,
      status: createDto.status || ComplianceStatus.ACTIVE,
    });
    
    const saved = await created.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'agr_compliance.created', resource: 'agr_compliance',
      resourceId: saved._id.toString(),
    });

    return saved;
  }

  async findAll(orgId: string, projectId: string): Promise<AgrComplianceRecord[]> {
    return this.complianceModel
      .find({ organizationId: orgId, projectId, deletedAt: null })
      .sort({ effectiveDate: -1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<AgrComplianceRecord> {
    const record = await this.complianceModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!record) {
      throw new NotFoundException(`Compliance Record #${id} not found`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateComplianceDto, orgId: string): Promise<AgrComplianceRecord> {
    const existing = await this.complianceModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existing) {
      throw new NotFoundException(`Compliance Record #${id} not found`);
    }

    Object.assign(existing, updateDto);
    const updated = await existing.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'agr_compliance.updated', resource: 'agr_compliance',
      resourceId: id, changes: updateDto,
    });

    return updated;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const record = await this.complianceModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!record) {
      throw new NotFoundException(`Compliance Record #${id} not found`);
    }
  }
}
