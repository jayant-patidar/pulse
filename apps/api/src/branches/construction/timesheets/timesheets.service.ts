import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimesheetDocument } from './timesheets.schema';
import { MembershipsService } from '../../../root/memberships/memberships.service';

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectModel(TimesheetDocument.name) private readonly timesheetModel: Model<TimesheetDocument>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async logTime(
    membershipId: string,
    projectId: string,
    dto: { date: string; hoursWorked: number; costCode?: string }
  ): Promise<TimesheetDocument> {
    const targetDate = new Date(dto.date);
    
    // Validations: No duplicate cost codes on the same day, total <= 24 hours
    const existing = await this.timesheetModel.find({
      membershipId: new Types.ObjectId(membershipId),
      date: targetDate,
    });

    let totalHours = 0;
    for (const ts of existing) {
      if (ts.costCode === dto.costCode) {
        throw new BadRequestException('Duplicate entry: You already have a timesheet for this cost code on this date.');
      }
      totalHours += ts.hoursWorked;
    }

    if (totalHours + dto.hoursWorked > 24) {
      throw new BadRequestException(`Total hours limit exceeded: You already have ${totalHours} hours logged on this date.`);
    }

    return this.timesheetModel.create({
      membershipId: new Types.ObjectId(membershipId),
      projectId: new Types.ObjectId(projectId),
      date: targetDate,
      hoursWorked: dto.hoursWorked,
      costCode: dto.costCode,
    });
  }

  async getTimesheets(userId: string, orgId: string, projectId: string): Promise<TimesheetDocument[]> {
    const membership = await this.membershipsService.findByUserAndOrg(userId, orgId);
    if (!membership) throw new NotFoundException('Membership not found');

    if (membership.role === 'OWNER' || membership.role === 'ADMIN') {
      // Admins/Owners see all timesheets for project
      return this.timesheetModel.find({ projectId: new Types.ObjectId(projectId) })
        .populate({ path: 'membershipId', populate: { path: 'userId' } })
        .sort({ date: -1 })
        .exec();
    }

    if (membership.role === 'MANAGER' || membership.role === 'SUPERVISOR') {
      // See their own and their subordinates
      const subordinates = await this.membershipsService.getSubordinates(membership._id.toString());
      const membershipIds = [membership._id, ...subordinates.map(s => s._id)];
      return this.timesheetModel.find({ 
        projectId: new Types.ObjectId(projectId),
        membershipId: { $in: membershipIds }
      })
        .populate({ path: 'membershipId', populate: { path: 'userId' } })
        .sort({ date: -1 })
        .exec();
    }

    // Workers only see their own
    return this.timesheetModel.find({ 
      projectId: new Types.ObjectId(projectId),
      membershipId: membership._id 
    })
      .populate({ path: 'membershipId', populate: { path: 'userId' } })
      .sort({ date: -1 })
      .exec();
  }

  async updateStatus(timesheetId: string, status: string, approverMembershipId: string): Promise<TimesheetDocument> {
    const timesheet = await this.timesheetModel.findByIdAndUpdate(
      timesheetId,
      { $set: { status, approvedBy: new Types.ObjectId(approverMembershipId) } },
      { new: true }
    );
    if (!timesheet) throw new NotFoundException('Timesheet not found');
    return timesheet;
  }

  async updateTime(
    timesheetId: string,
    membershipId: string,
    dto: { date: string; hoursWorked: number; costCode?: string }
  ): Promise<TimesheetDocument> {
    const ts = await this.timesheetModel.findOne({ _id: timesheetId, membershipId: new Types.ObjectId(membershipId) });
    if (!ts) throw new NotFoundException('Timesheet not found or access denied');
    if (ts.status === 'APPROVED') throw new BadRequestException('Cannot modify an approved timesheet');

    const targetDate = new Date(dto.date);
    const existing = await this.timesheetModel.find({
      membershipId: new Types.ObjectId(membershipId),
      date: targetDate,
      _id: { $ne: ts._id }
    });

    let totalHours = 0;
    for (const existingTs of existing) {
      if (existingTs.costCode === dto.costCode) {
        throw new BadRequestException('Duplicate entry: You already have a timesheet for this cost code on this date.');
      }
      totalHours += existingTs.hoursWorked;
    }

    if (totalHours + dto.hoursWorked > 24) {
      throw new BadRequestException(`Total hours limit exceeded: You already have ${totalHours} hours logged on this date.`);
    }

    ts.date = targetDate;
    ts.hoursWorked = dto.hoursWorked;
    ts.costCode = dto.costCode;
    // Reset status to pending if it was rejected and they updated it
    if (ts.status === 'REJECTED') {
      ts.status = 'PENDING';
    }
    
    return ts.save();
  }
}
