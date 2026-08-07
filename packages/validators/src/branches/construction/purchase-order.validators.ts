import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  supplierName: z.string().min(1, 'Supplier Name is required').max(200),
  supplierContact: z.string().max(200).optional(),
  totalAmountCents: z.number().int().nonnegative(),
  deliveryDateExpected: z.string().datetime().optional(),
  deliveryLocation: z.string().max(300).optional(),
  paymentTerms: z.string().max(200).optional(),
  issuedBy: z.string().min(1, 'Issued By is required'),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial().omit({ projectId: true }).extend({
  status: z.enum(['DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED']).optional(),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
