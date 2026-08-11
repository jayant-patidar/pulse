import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationDocument } from './organizations.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(OrganizationDocument.name)
    private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async create(data: { name: string; industry: string }): Promise<OrganizationDocument> {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.orgModel.create({ ...data, slug });
  }

  async findById(id: string): Promise<OrganizationDocument | null> {
    return this.orgModel.findById(id);
  }

  async findBySlug(slug: string): Promise<OrganizationDocument | null> {
    return this.orgModel.findOne({ slug });
  }

  async update(id: string, data: Partial<OrganizationDocument>): Promise<OrganizationDocument | null> {
    return this.orgModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }
}
