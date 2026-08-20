import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangeOrderRecord, ChangeOrderStatus } from './change-order.schema';
import { CreateChangeOrderDto } from './dto/create-change-order.dto';
import { UpdateChangeOrderDto } from './dto/update-change-order.dto';

const CO_STATUS_TRANSITIONS: Record<ChangeOrderStatus, ChangeOrderStatus[]> = {
  [ChangeOrderStatus.DRAFT]: [ChangeOrderStatus.SUBMITTED],
  [ChangeOrderStatus.SUBMITTED]: [ChangeOrderStatus.UNDER_REVIEW, ChangeOrderStatus.DRAFT],
  [ChangeOrderStatus.UNDER_REVIEW]: [ChangeOrderStatus.APPROVED, ChangeOrderStatus.REJECTED, ChangeOrderStatus.REVISE],
  [ChangeOrderStatus.REVISE]: [ChangeOrderStatus.SUBMITTED],
  [ChangeOrderStatus.APPROVED]: [],
  [ChangeOrderStatus.REJECTED]: [],
};

@Injectable()
export class ChangeOrdersService {
  constructor(
    @InjectModel(ChangeOrderRecord.name)
    private coModel: Model<ChangeOrderRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateChangeOrderDto, orgId: string, userId: string): Promise<ChangeOrderRecord> {
    const createdCo = new this.coModel({
      ...createDto,
      organizationId: orgId,
      requestedBy: userId,
      status: ChangeOrderStatus.DRAFT, // Always force DRAFT on creation
    });
    
    const saved = await createdCo.save();
    
    this.eventEmitter.emit('audit.log', {
      organizationId: orgId, userId,
      action: 'change_order.created', resource: 'change_order',
      resourceId: saved._id.toString(),
    });

    return saved;
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

  async update(id: string, updateDto: UpdateChangeOrderDto, orgId: string, userId?: string): Promise<ChangeOrderRecord> {
    const existingCo = await this.coModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existingCo) {
      throw new NotFoundException(`Change Order #${id} not found`);
    }

    const updatePayload: any = { ...updateDto };

    // --- State Machine Validation ---
    if (updateDto.status && updateDto.status !== existingCo.status) {
      const allowed = CO_STATUS_TRANSITIONS[existingCo.status] || [];
      if (!allowed.includes(updateDto.status as ChangeOrderStatus)) {
        throw new BadRequestException(
          `Cannot transition Change Order from ${existingCo.status} to ${updateDto.status}.`
        );
      }
      
      // If moving to APPROVED, enforce signatures (Mocking permission check for now)
      if (updateDto.status === ChangeOrderStatus.APPROVED) {
        updatePayload.approvedBy = userId;
        updatePayload.approvedAt = new Date();
      }
    }

    // --- Financial/Schedule Lockdown ---
    // Cannot edit impacts unless it is in DRAFT or REVISE state
    const isEditingImpacts = updateDto.costImpactCents !== undefined || updateDto.scheduleImpactDays !== undefined || updateDto.lineItems !== undefined;
    const isEditableState = existingCo.status === ChangeOrderStatus.DRAFT || existingCo.status === ChangeOrderStatus.REVISE;
    
    if (isEditingImpacts && !isEditableState) {
      throw new BadRequestException(`Cannot edit cost or schedule impacts while Change Order is in ${existingCo.status} state.`);
    }

    Object.assign(existingCo, updatePayload);
    const updated = await existingCo.save();

    if (userId) {
      this.eventEmitter.emit('audit.log', {
        organizationId: orgId, userId,
        action: 'change_order.updated', resource: 'change_order',
        resourceId: id, changes: updateDto,
      });
    }

    return updated;
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
