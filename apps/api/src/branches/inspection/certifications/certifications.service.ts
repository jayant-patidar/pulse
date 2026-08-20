import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CertificationRecord } from './certification.schema';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectModel(CertificationRecord.name) private readonly certificationModel: Model<CertificationRecord>,
  ) {}

  async create(organizationId: string, createDto: CreateCertificationDto): Promise<CertificationRecord> {
    const created = new this.certificationModel({
      ...createDto,
      organizationId,
    });
    return created.save();
  }

  async findAll(organizationId: string, projectId?: string): Promise<CertificationRecord[]> {
    const filter: any = { organizationId, deletedAt: { $exists: false } };
    if (projectId) filter.projectId = projectId;
    return this.certificationModel.find(filter).sort({ issuedDate: -1 }).exec();
  }

  async findOne(organizationId: string, id: string): Promise<CertificationRecord> {
    const record = await this.certificationModel.findOne({
      _id: id,
      organizationId,
      deletedAt: { $exists: false },
    }).exec();
    if (!record) throw new NotFoundException('Certification not found');
    return record;
  }

  async update(organizationId: string, id: string, updateDto: UpdateCertificationDto): Promise<CertificationRecord> {
    const updated = await this.certificationModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: updateDto },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Certification not found');
    return updated;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const record = await this.certificationModel.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date() } },
    ).exec();
    if (!record) throw new NotFoundException('Certification not found');
  }
}
