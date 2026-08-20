import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { MembershipDocument } from './memberships.schema';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(MembershipDocument.name) private readonly membershipModel: Model<MembershipDocument>,
    private readonly orgsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Create an org and make the user its Owner */
  async createOrgWithOwner(userId: string, orgName: string, industry: string): Promise<MembershipDocument> {
    const org = await this.orgsService.create({ name: orgName, industry });
    const membership = await this.membershipModel.create({
      userId,
      organizationId: org._id,
      role: 'OWNER',
      status: 'ACTIVE',
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: org._id.toString(),
      userId,
      action: 'organization.created',
      resource: 'organization',
      resourceId: org._id.toString(),
    });

    return membership;
  }

  /** Invite a user via token (Legacy flow, keeping for external contractors if needed) */
  async invite(orgId: string, email: string, role: string, invitedByUserId: string): Promise<MembershipDocument> {
    const validRoles = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'WORKER', 'CONTRACTOR'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    const invitationToken = randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const membership = await this.membershipModel.create({
      organizationId: orgId,
      role,
      status: 'PENDING',
      invitationToken,
      invitationExpiresAt,
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId: invitedByUserId,
      action: 'membership.invited',
      resource: 'membership',
      resourceId: membership._id.toString(),
      changes: { email, role },
    });

    return membership;
  }

  /** Onboard a new internal employee with auto-generated credentials */
  async onboardEmployee(
    orgId: string,
    onboardedByUserId: string,
    dto: {
      firstName: string;
      lastName: string;
      role: string;
      employmentType: string;
      reportsTo?: string;
    }
  ): Promise<{ membership: MembershipDocument; tempPassword: string; email: string }> {
    const validRoles = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'WORKER', 'CONTRACTOR'];
    if (!validRoles.includes(dto.role)) {
      throw new BadRequestException(`Invalid role: ${dto.role}. Must be one of: ${validRoles.join(', ')}`);
    }

    const org = await this.orgsService.findById(orgId);
    if (!org) throw new NotFoundException('Organization not found');

    // Generate corporate email
    const cleanFirst = dto.firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = dto.lastName.toLowerCase().replace(/[^a-z]/g, '');
    let baseEmail = `${cleanFirst}.${cleanLast}@${org.slug}.com`;
    
    // Ensure uniqueness
    let email = baseEmail;
    let counter = 1;
    while (await this.usersService.findByEmail(email)) {
      email = `${cleanFirst}.${cleanLast}${counter}@${org.slug}.com`;
      counter++;
    }

    // Generate temp password
    const tempPassword = randomBytes(6).toString('hex'); // 12 char password
    const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id });

    // Generate 10-digit employee ID
    const employeeId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Create User
    const user = await this.usersService.create({
      email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      mustChangePassword: true,
    });

    // Create Membership
    const membership = await this.membershipModel.create({
      userId: user._id,
      organizationId: org._id,
      role: dto.role,
      status: 'ACTIVE',
      employmentType: dto.employmentType,
      employeeId,
      reportsTo: dto.reportsTo ? new Types.ObjectId(dto.reportsTo) : undefined,
    });

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId: onboardedByUserId,
      action: 'membership.onboarded',
      resource: 'membership',
      resourceId: membership._id.toString(),
      changes: { employeeId, role: dto.role },
    });

    return { membership, tempPassword, email };
  }

  /** Reset an employee's password and force them to change it on next login */
  async resetEmployeePassword(membershipId: string, orgId: string, requestedByUserId: string): Promise<{ tempPassword: string }> {
    const membership = await this.membershipModel.findOne({ _id: membershipId, organizationId: orgId });
    if (!membership || !membership.userId) {
      throw new NotFoundException('Membership or User not found');
    }

    const tempPassword = randomBytes(6).toString('hex');
    const passwordHash = await argon2.hash(tempPassword);

    await this.usersService.updatePassword(membership.userId.toString(), passwordHash, true);

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId: requestedByUserId,
      action: 'membership.password_reset',
      resource: 'membership',
      resourceId: membershipId,
    });

    return { tempPassword };
  }

  /** Update a member's role */
  async updateRole(membershipId: string, newRole: string, orgId: string): Promise<MembershipDocument> {
    const membership = await this.membershipModel.findOne({ _id: membershipId, organizationId: orgId });
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    if (membership.role === 'OWNER') {
      throw new BadRequestException('Cannot change the role of an OWNER');
    }

    const oldRole = membership.role;
    membership.role = newRole;
    await membership.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId: membership.userId?.toString(),
      action: 'membership.role_changed',
      resource: 'membership',
      resourceId: membershipId,
      changes: { from: oldRole, to: newRole },
    });

    return membership;
  }

  /** Deactivate (remove) a member */
  async deactivate(membershipId: string, orgId: string): Promise<{ success: boolean }> {
    const membership = await this.membershipModel.findOne({ _id: membershipId, organizationId: orgId });
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    if (membership.role === 'OWNER') {
      throw new BadRequestException('Cannot remove an OWNER from the organization');
    }

    membership.status = 'INACTIVE';
    await membership.save();

    this.eventEmitter.emit('audit.log', {
      organizationId: orgId,
      userId: membership.userId?.toString(),
      action: 'membership.deactivated',
      resource: 'membership',
      resourceId: membershipId,
    });

    return { success: true };
  }

  async findByUserId(userId: string): Promise<MembershipDocument[]> {
    return this.membershipModel.find({ userId: new Types.ObjectId(userId), status: 'ACTIVE' });
  }

  async getSubordinates(managerMembershipId: string): Promise<MembershipDocument[]> {
    return this.membershipModel.find({ reportsTo: new Types.ObjectId(managerMembershipId) });
  }

  async findByUserAndOrg(userId: string, orgId: string): Promise<MembershipDocument | null> {
    return this.membershipModel.findOne({ 
      userId: new Types.ObjectId(userId), 
      organizationId: new Types.ObjectId(orgId), 
      status: 'ACTIVE' 
    });
  }

  async findByOrg(orgId: string): Promise<MembershipDocument[]> {
    return this.membershipModel.find({ 
      organizationId: new Types.ObjectId(orgId), 
      status: { $in: ['ACTIVE', 'PENDING'] } 
    })
      .populate('userId')
      .populate({
        path: 'reportsTo',
        populate: { path: 'userId' }
      })
      .exec();
  }
}
