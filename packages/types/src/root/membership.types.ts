// ============================================================
// Membership Types — ROOT Layer
// ============================================================
// Junction linking Users to Organizations with Roles.
// See: Doc 05 §4.3, Doc 07 §5
// ============================================================

export type OrgRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'WORKER' | 'CONTRACTOR';
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DECLINED';

export interface ProjectRoleOverride {
  projectId: string;
  role: OrgRole;
}

export interface NotificationPreferences {
  emailDigest: 'DAILY' | 'WEEKLY' | 'NEVER';
  pushEnabled: boolean;
  smsEnabled: boolean;
  mutedEntities: string[];
}

export interface Membership {
  _id: string;
  userId: string;
  organizationId: string;

  // Role & Status
  role: OrgRole;
  customRoleId?: string;
  status: MembershipStatus;
  invitationToken?: string;
  invitationExpiresAt?: Date;

  // Profile overrides
  orgSpecificTitle?: string;
  orgSpecificDepartment?: string;
  orgSpecificEmployeeId?: string;

  // Team Assignments
  teamIds: string[];

  // Project-specific Role Overrides
  projectRoles: ProjectRoleOverride[];

  // Notification Preferences
  notificationPreferences: NotificationPreferences;

  createdAt: Date;
  updatedAt: Date;
}

export type InviteMemberPayload = {
  email: string;
  role: OrgRole;
  teamIds?: string[];
};
