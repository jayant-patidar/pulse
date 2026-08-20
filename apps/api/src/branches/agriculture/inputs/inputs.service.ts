import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInputDto } from './dto/create-input.dto';
import { UpdateInputDto } from './dto/update-input.dto';
import { InputInventoryRecord, InputStatus } from './input-inventory.schema';

@Injectable()
export class InputsService {
  constructor(
    @InjectModel(InputInventoryRecord.name)
    private inputModel: Model<InputInventoryRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateInputDto, orgId: string): Promise<InputInventoryRecord> {
    const created = new this.inputModel({
      ...createDto,
      organizationId: orgId,
    });
    
    // Logic for auto-status
    if (created.quantityOnHand === 0) {
      created.status = InputStatus.OUT_OF_STOCK;
    } else if (created.quantityOnHand < 10) { // arbitrary threshold for now
      created.status = InputStatus.LOW_STOCK;
    }

    const saved = await created.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'input_inventory.created', resource: 'input_inventory',
      resourceId: saved._id.toString(),
    });

    return saved;
  }

  async findAll(orgId: string): Promise<InputInventoryRecord[]> {
    return this.inputModel
      .find({ organizationId: orgId, deletedAt: null })
      .sort({ productName: 1 })
      .exec();
  }

  async findOne(id: string, orgId: string): Promise<InputInventoryRecord> {
    const record = await this.inputModel
      .findOne({ _id: id, organizationId: orgId, deletedAt: null })
      .exec();
    
    if (!record) {
      throw new NotFoundException(`Input Inventory Item #${id} not found`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateInputDto, orgId: string): Promise<InputInventoryRecord> {
    const existing = await this.inputModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existing) {
      throw new NotFoundException(`Input Inventory Item #${id} not found`);
    }

    Object.assign(existing, updateDto);

    // Logic for auto-status
    if (existing.quantityOnHand === 0) {
      existing.status = InputStatus.OUT_OF_STOCK;
    } else if (existing.quantityOnHand < 10) {
      existing.status = InputStatus.LOW_STOCK;
    } else {
      existing.status = InputStatus.IN_STOCK;
    }

    const updated = await existing.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'input_inventory.updated', resource: 'input_inventory',
      resourceId: id, changes: updateDto,
    });

    return updated;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const record = await this.inputModel
      .findOneAndUpdate(
        { _id: id, organizationId: orgId, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    if (!record) {
      throw new NotFoundException(`Input Inventory Item #${id} not found`);
    }
  }
}
