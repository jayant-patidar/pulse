// ============================================================
// Organization Types — ROOT Layer
// ============================================================
// The Tenant. Represents a paying customer company.
// See: Doc 05 §4.2
// ============================================================

export type Industry = 'CONSTRUCTION' | 'AGRICULTURE' | 'ENERGY' | 'HVAC';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL';

export interface OrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface OrganizationSettings {
  defaultDateFormat: string;
  fiscalYearStartMonth: number;
  requireApprovalForReports: boolean;
  enforce2FAForAdmins: boolean;
}

export interface OrganizationBilling {
  stripeCustomerId?: string;
  subscriptionId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialEndsAt?: Date;
  maxUsers: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  industry: Industry;

  // Profile & Branding
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: OrganizationAddress;

  // Settings
  timezone: string;
  currency: string;
  settings: OrganizationSettings;

  // Billing
  billing: OrganizationBilling;

  createdAt: Date;
  updatedAt: Date;
}

export type CreateOrganizationPayload = Pick<Organization, 'name' | 'industry'> & {
  timezone?: string;
  currency?: string;
};
