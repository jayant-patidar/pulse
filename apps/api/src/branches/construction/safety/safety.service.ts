import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SafetyIncidentRecord, IncidentStatus } from './safety.schema';
import { CreateSafetyIncidentDto } from './dto/create-safety-incident.dto';
import { UpdateSafetyIncidentDto } from './dto/update-safety-incident.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

const SAFETY_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.OPEN]: [IncidentStatus.UNDER_INVESTIGATION, IncidentStatus.CLOSED],
  [IncidentStatus.UNDER_INVESTIGATION]: [IncidentStatus.CLOSED, IncidentStatus.OPEN],
  [IncidentStatus.CLOSED]: [IncidentStatus.OPEN], // Allow reopening if new evidence is found
};

@Injectable()
export class SafetyService {
  constructor(
    @InjectModel(SafetyIncidentRecord.name)
    private safetyModel: Model<SafetyIncidentRecord>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateSafetyIncidentDto, orgId: string): Promise<SafetyIncidentRecord> {
    const createdIncident = new this.safetyModel({
      ...createDto,
      organizationId: orgId,
      status: IncidentStatus.OPEN,
    });
    
    const saved = await createdIncident.save();

    // Enterprise Workflow: Alert on CRITICAL or OSHA recordable
    if (saved.severity === 'CRITICAL' || (saved as any).oshaRecordable) {
      this.eventEmitter.emit('notification.send', {
        organizationId: orgId,
        userId: 'admin', // In real app, query for Safety Officers
        title: `CRITICAL SAFETY INCIDENT: ${saved.incidentType}`,
        body: `A critical incident occurred on ${saved.dateOccurred.toDateString()}. Immediate action required.`,
        type: 'URGENT',
        link: `/projects/${saved.projectId}/safety/${saved._id}`,
      });
    }

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'safety_incident.created', resource: 'safety_incident',
      resourceId: saved._id.toString(),
    });

    return saved;
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
    const existingIncident = await this.safetyModel.findOne({ _id: id, organizationId: orgId, deletedAt: null }).exec();
    
    if (!existingIncident) {
      throw new NotFoundException(`Safety incident #${id} not found`);
    }

    // --- State Machine Validation ---
    if (updateDto.status && updateDto.status !== existingIncident.status) {
      const allowed = SAFETY_STATUS_TRANSITIONS[existingIncident.status] || [];
      if (!allowed.includes(updateDto.status as IncidentStatus)) {
        throw new Error(
          `Cannot transition Safety Incident from ${existingIncident.status} to ${updateDto.status}.`
        );
      }
    }

    // --- Safety Data Integrity ---
    // Cannot downgrade severity once set to CRITICAL (Enterprise rule)
    if (existingIncident.severity === 'CRITICAL' && updateDto.severity && updateDto.severity !== 'CRITICAL') {
      throw new Error('Cannot downgrade a CRITICAL safety incident. Please create a new report if classified incorrectly.');
    }

    Object.assign(existingIncident, updateDto);
    const updated = await existingIncident.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      action: 'safety_incident.updated', resource: 'safety_incident',
      resourceId: id, changes: updateDto,
    });

    return updated;
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
