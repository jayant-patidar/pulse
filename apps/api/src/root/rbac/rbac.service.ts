import { Injectable, Logger } from '@nestjs/common';
import { MembershipsService } from '../memberships/memberships.service';
import {
  ROOT_PERMISSIONS,
  TRUNK_PERMISSIONS,
  CONSTRUCTION_PERMISSIONS,
  type Permission,
} from '@pulse/types';

/**
 * Default role → permissions mapping.
 * See: Doc 07 §6
 */
const ROLE_DEFAULTS: Record<string, Permission[]> = {
  OWNER: [
    ...Object.values(ROOT_PERMISSIONS),
    ...Object.values(TRUNK_PERMISSIONS),
    ...Object.values(CONSTRUCTION_PERMISSIONS),
  ],
  ADMIN: [
    ROOT_PERMISSIONS.ORG_READ,
    ROOT_PERMISSIONS.ORG_UPDATE,
    ROOT_PERMISSIONS.USER_INVITE,
    ROOT_PERMISSIONS.USER_MANAGE_ROLES,
    ROOT_PERMISSIONS.TEAM_MANAGE,
    ...Object.values(TRUNK_PERMISSIONS),
    ...Object.values(CONSTRUCTION_PERMISSIONS),
  ],
  MANAGER: [
    ROOT_PERMISSIONS.ORG_READ,
    ROOT_PERMISSIONS.USER_INVITE,
    TRUNK_PERMISSIONS.PROJECT_CREATE,
    TRUNK_PERMISSIONS.PROJECT_READ,
    TRUNK_PERMISSIONS.PROJECT_UPDATE,
    TRUNK_PERMISSIONS.TASK_CREATE,
    TRUNK_PERMISSIONS.TASK_READ,
    TRUNK_PERMISSIONS.TASK_UPDATE,
    TRUNK_PERMISSIONS.TASK_DELETE,
    TRUNK_PERMISSIONS.REPORT_CREATE,
    TRUNK_PERMISSIONS.REPORT_READ,
    TRUNK_PERMISSIONS.REPORT_APPROVE,
    TRUNK_PERMISSIONS.DOCUMENT_UPLOAD,
    TRUNK_PERMISSIONS.DOCUMENT_READ,
    TRUNK_PERMISSIONS.DOCUMENT_DELETE,
    TRUNK_PERMISSIONS.DOCUMENT_APPROVE,
    TRUNK_PERMISSIONS.EQUIPMENT_MANAGE,
    CONSTRUCTION_PERMISSIONS.CON_FINANCE_READ,
    CONSTRUCTION_PERMISSIONS.CON_CO_CREATE,
    CONSTRUCTION_PERMISSIONS.CON_CO_APPROVE,
    CONSTRUCTION_PERMISSIONS.CON_SAFETY_CREATE,
    CONSTRUCTION_PERMISSIONS.CON_SAFETY_INVESTIGATE,
    CONSTRUCTION_PERMISSIONS.CON_PO_MANAGE,
    CONSTRUCTION_PERMISSIONS.CON_COI_MANAGE,
  ],
  SUPERVISOR: [
    ROOT_PERMISSIONS.ORG_READ,
    TRUNK_PERMISSIONS.PROJECT_READ,
    TRUNK_PERMISSIONS.TASK_CREATE,
    TRUNK_PERMISSIONS.TASK_READ,
    TRUNK_PERMISSIONS.TASK_UPDATE,
    TRUNK_PERMISSIONS.REPORT_CREATE,
    TRUNK_PERMISSIONS.REPORT_READ,
    TRUNK_PERMISSIONS.DOCUMENT_UPLOAD,
    TRUNK_PERMISSIONS.DOCUMENT_READ,
    TRUNK_PERMISSIONS.EQUIPMENT_MANAGE,
    CONSTRUCTION_PERMISSIONS.CON_SAFETY_CREATE,
  ],
  WORKER: [
    ROOT_PERMISSIONS.ORG_READ,
    TRUNK_PERMISSIONS.PROJECT_READ,
    TRUNK_PERMISSIONS.TASK_READ,
    TRUNK_PERMISSIONS.TASK_UPDATE,
    TRUNK_PERMISSIONS.REPORT_CREATE,
    TRUNK_PERMISSIONS.REPORT_READ,
    TRUNK_PERMISSIONS.DOCUMENT_READ,
  ],
  CONTRACTOR: [
    ROOT_PERMISSIONS.ORG_READ,
    TRUNK_PERMISSIONS.PROJECT_READ,
    TRUNK_PERMISSIONS.TASK_READ,
    TRUNK_PERMISSIONS.REPORT_READ,
    TRUNK_PERMISSIONS.DOCUMENT_READ,
    TRUNK_PERMISSIONS.DOCUMENT_UPLOAD,
  ],
};

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly membershipsService: MembershipsService) {}

  /**
   * Resolve all permissions for a user in a given org.
   * Considers the user's org-level role.
   * TODO: Add project-level role overrides and Redis caching.
   */
  async resolvePermissions(userId: string, orgId: string): Promise<Permission[]> {
    const membership = await this.membershipsService.findByUserAndOrg(userId, orgId);
    if (!membership) return [];

    const rolePermissions = ROLE_DEFAULTS[membership.role] || [];
    return rolePermissions;
  }

  /**
   * Check if the user has ALL of the required permissions.
   */
  async hasPermissions(userId: string, orgId: string, required: string[]): Promise<boolean> {
    const permissions = await this.resolvePermissions(userId, orgId);
    return required.every((p) => permissions.includes(p));
  }
}
