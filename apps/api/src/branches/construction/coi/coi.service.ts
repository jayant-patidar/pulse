import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoiRecord, CoiStatus } from './coi.schema';
import { CreateCoiDto } from './dto/create-coi.dto';
import { UpdateCoiDto } from './dto/update-coi.dto';

@Injectable()
export class CoiService {
  constructor(
    @InjectModel(CoiRecord.name)
    private coiModel: Model<CoiRecord>,
  ) {}

  async create(createDto: CreateCoiDto, orgId: string): Promise<CoiRecord> {
    const createdCoi = new this.coiModel({
      ...createDto,
      organizationId: orgId,
      status: createDto.status || CoiStatus.COMPLIANT,
    });
    return createdCoi.save();
  }

  async findAll(orgId: string): Promise<CoiRecord[]> {
    return this.coiModel
      .find({ organizationId: orgId, deletedAt: null })
      .sort({ expiryDate: 1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<CoiRecord> {
    const coi = await this.coiModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!coi) {
      throw new NotFoundException(`COI #${id} not found`);
    }
    return coi;
  }

  async update(id: string, updateDto: UpdateCoiDto, orgId: string): Promise<CoiRecord> {
    const existingCoi = await this.coiModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: updateDto },
        { new: true },
      )
      .exec();

    if (!existingCoi) {
      throw new NotFoundException(`COI #${id} not found`);
    }
    return existingCoi;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const coi = await this.coiModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!coi) {
      throw new NotFoundException(`COI #${id} not found`);
    }
  }
}
