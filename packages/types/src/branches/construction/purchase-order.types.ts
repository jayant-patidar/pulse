// ============================================================
// Purchase Order Types — BRANCH Layer (Construction)
// ============================================================
export type PurchaseOrderStatus = 'DRAFT' | 'ISSUED' | 'ACKNOWLEDGED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';

export interface PurchaseOrderLineItem {
  materialDescription: string;
  costCode?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPriceCents: number;
  totalCents: number;
  quantityReceived: number;
}

export interface PurchaseOrder {
  _id: string;
  organizationId: string;
  projectId: string;
  poNumber: string;
  supplierName: string;
  supplierContact?: string;
  status: PurchaseOrderStatus;
  lineItems: PurchaseOrderLineItem[];
  totalAmountCents: number;
  deliveryDateExpected?: Date;
  deliveryLocation?: string;
  paymentTerms?: string;
  issuedBy: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
