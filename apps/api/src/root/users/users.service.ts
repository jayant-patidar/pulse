import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserDocument.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async update(id: string, data: Partial<{ firstName: string; lastName: string; phone: string }>): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { $set: { passwordHash } });
  }
}
