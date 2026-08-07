import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrderRecord, PurchaseOrderStatus } from './purchase-order.schema';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectModel(PurchaseOrderRecord.name)
    private poModel: Model<PurchaseOrderRecord>,
  ) {}

  async create(createDto: CreatePurchaseOrderDto, orgId: string, userId: string): Promise<PurchaseOrderRecord> {
    const createdPo = new this.poModel({
      ...createDto,
      organizationId: orgId,
      issuedBy: userId,
      status: createDto.status || PurchaseOrderStatus.DRAFT,
    });
    return createdPo.save();
  }

  async findAll(orgId: string, projectId?: string): Promise<PurchaseOrderRecord[]> {
    const query: any = { organizationId: orgId, deletedAt: null };
    if (projectId) {
      query.projectId = projectId;
    }
    return this.poModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, orgId: string): Promise<PurchaseOrderRecord> {
    const po = await this.poModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!po) {
      throw new NotFoundException(`Purchase Order #${id} not found`);
    }
    return po;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto, orgId: string): Promise<PurchaseOrderRecord> {
    const existingPo = await this.poModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: updateDto },
        { new: true },
      )
      .exec();

    if (!existingPo) {
      throw new NotFoundException(`Purchase Order #${id} not found`);
    }
    return existingPo;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const po = await this.poModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!po) {
      throw new NotFoundException(`Purchase Order #${id} not found`);
    }
  }
}
