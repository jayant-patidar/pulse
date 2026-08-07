// ============================================================
// Auth Types — ROOT Layer
// ============================================================
// JWT payloads, login/register DTOs, and session types.
// See: Doc 07 §2
// ============================================================

export interface JwtPayload {
  sub: string;   // userId
  org: string;   // organizationId
  role: string;  // org-level role
  iat: number;
  exp: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  industry: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OrgSelectionPayload {
  orgSelectionToken: string;
  organizationId: string;
}

/** Returned when user belongs to multiple orgs */
export interface OrgSelectionRequired {
  requiresOrgSelection: true;
  orgSelectionToken: string;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    industry: string;
    role: string;
  }>;
}
