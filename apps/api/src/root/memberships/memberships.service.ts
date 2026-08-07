import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MembershipDocument } from './memberships.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { randomBytes } from 'crypto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(MembershipDocument.name) private readonly membershipModel: Model<MembershipDocument>,
    private readonly orgsService: OrganizationsService,
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

  /** Invite a user to an organization */
  async invite(orgId: string, email: string, role: string, invitedByUserId: string): Promise<MembershipDocument> {
    const validRoles = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'WORKER', 'CONTRACTOR'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check for existing membership with this email (requires user lookup by email)
    // For now, create a PENDING membership with an invitation token.
    // The invited user will accept by registering or logging in with the matching email.
    const invitationToken = randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const membership = await this.membershipModel.create({
      organizationId: orgId,
      role,
      status: 'PENDING',
      invitationToken,
      invitationExpiresAt,
      // userId will be set when the invite is accepted
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
    });
  }
}
