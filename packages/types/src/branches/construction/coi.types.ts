// ============================================================
// Certificate of Insurance Types — BRANCH Layer (Construction)
// ============================================================
export type CoiPolicyType = 'GENERAL_LIABILITY' | 'WORKERS_COMP' | 'AUTO' | 'UMBRELLA' | 'PROFESSIONAL';
export type CoiStatus = 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' | 'REJECTED';

export interface CertificateOfInsurance {
  _id: string;
  organizationId: string;
  subcontractorOrgId?: string;
  subcontractorName?: string;
  policyType: CoiPolicyType;
  carrierName: string;
  policyNumber: string;
  perOccurrenceLimitCents?: number;
  aggregateLimitCents?: number;
  effectiveDate: Date;
  expiryDate: Date;
  status: CoiStatus;
  projectSpecificIds: string[];
  documentId?: string;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
