import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangeOrderRecord, ChangeOrderStatus } from './change-order.schema';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderDto } from './dto/update-change-order.dto';

@Injectable()
export class ChangeOrdersService {
  constructor(
    @InjectModel(ChangeOrderRecord.name)
    private coModel: Model<ChangeOrderRecord>,
  ) {}

  async create(createDto: CreateChangeOrderDto, orgId: string, userId: string): Promise<ChangeOrderRecord> {
    const createdCo = new this.coModel({
      ...createDto,
      organizationId: orgId,
      requestedBy: userId,
      status: createDto.status || ChangeOrderStatus.DRAFT,
    });
    return createdCo.save();
  }

  async findAll(orgId: string, projectId?: string): Promise<ChangeOrderRecord[]> {
    const query: any = { organizationId: orgId, deletedAt: null };
    if (projectId) {
      query.projectId = projectId;
    }
    return this.coModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, orgId: string): Promise<ChangeOrderRecord> {
    const co = await this.coModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!co) {
      throw new NotFoundException(`Change Order #${id} not found`);
    }
    return co;
  }

  async update(id: string, updateDto: UpdateChangeOrderDto, orgId: string): Promise<ChangeOrderRecord> {
    const existingCo = await this.coModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: updateDto },
        { new: true },
      )
      .exec();

    if (!existingCo) {
      throw new NotFoundException(`Change Order #${id} not found`);
    }
    return existingCo;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const co = await this.coModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!co) {
      throw new NotFoundException(`Change Order #${id} not found`);
    }
  }
}
