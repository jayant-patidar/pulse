// ============================================================
// Change Order Types — BRANCH Layer (Construction)
// ============================================================
export type ChangeOrderStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REVISE' | 'APPROVED' | 'REJECTED';
export type ChangeOrderReason = 'OWNER_REQUEST' | 'DESIGN_CHANGE' | 'UNFORESEEN_CONDITION' | 'CODE_REQUIREMENT' | 'ERROR_OMISSION';

export interface ChangeOrderLineItem {
  description: string;
  costCode?: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface ChangeOrder {
  _id: string;
  organizationId: string;
  projectId: string;
  coNumber: string;
  title: string;
  description?: string;
  reasonCode: ChangeOrderReason;
  status: ChangeOrderStatus;
  costImpactCents: number;
  scheduleImpactDays: number;
  lineItems: ChangeOrderLineItem[];
  attachments: string[];
  requestedBy: string;
  approvedBy?: string;
  clientApprovalRequired?: boolean;
  clientApprovedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
