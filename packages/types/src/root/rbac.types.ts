// ============================================================
// RBAC Types — ROOT Layer
// ============================================================
// The industry-agnostic permission engine.
// Permissions are strings: "resource:action"
// Roles are arrays of these strings.
// See: Doc 07 §6, §7
// ============================================================

// ---- ROOT / ORG LEVEL PERMISSIONS ----
export const ROOT_PERMISSIONS = {
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  BILLING_MANAGE: 'billing:manage',
  USER_INVITE: 'user:invite',
  USER_MANAGE_ROLES: 'user:manage_roles',
  TEAM_MANAGE: 'team:manage',
} as const;

// ---- TRUNK / CORE PERMISSIONS ----
export const TRUNK_PERMISSIONS = {
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',

  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',

  REPORT_CREATE: 'report:create',
  REPORT_READ: 'report:read',
  REPORT_APPROVE: 'report:approve',
  REPORT_AMEND: 'report:amend',

  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_APPROVE: 'document:approve',

  EQUIPMENT_MANAGE: 'equipment:manage',
} as const;

// ---- BRANCH / CONSTRUCTION PERMISSIONS ----
// These are registered dynamically by the branch module on startup.
export const CONSTRUCTION_PERMISSIONS = {
  CON_FINANCE_READ: 'con_finance:read',
  CON_FINANCE_WRITE: 'con_finance:write',
  CON_CO_CREATE: 'con_co:create',
  CON_CO_APPROVE: 'con_co:approve',
  CON_SAFETY_CREATE: 'con_safety:create',
  CON_SAFETY_INVESTIGATE: 'con_safety:investigate',
  CON_COI_MANAGE: 'con_coi:manage',
  CON_PO_MANAGE: 'con_po:manage',
} as const;

export type Permission =
  | (typeof ROOT_PERMISSIONS)[keyof typeof ROOT_PERMISSIONS]
  | (typeof TRUNK_PERMISSIONS)[keyof typeof TRUNK_PERMISSIONS]
  | (typeof CONSTRUCTION_PERMISSIONS)[keyof typeof CONSTRUCTION_PERMISSIONS]
  | string; // Allows future branches to register new permissions

// ---- DEFAULT ROLE → PERMISSION MAPPINGS ----
export type RolePermissionMap = Record<string, Permission[]>;
